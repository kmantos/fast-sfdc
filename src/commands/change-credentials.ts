import * as vscode from 'vscode'
import configService from '../services/config-service'
import connector from '../sfdc-connector'
import StatusBar from '../statusbar'
import { ConfigCredential } from '../fast-sfdc'
import toolingService from '../services/tooling-service'

async function showCredsMenu (credentials: ConfigCredential[], currentCredential: number): Promise<number> {
  const res = await vscode.window.showQuickPick(
    credentials
      .map((x: ConfigCredential) => {
        return {
          label: x.username
        } as vscode.QuickPickItem
      })
      .filter((x: vscode.QuickPickItem, y: number) => y !== currentCredential),
    { ignoreFocusOut: true }
  )
  return res ? (credentials.findIndex(x => x.username === res.label)) : -1
}

export default async function changeCredentials () {
  const config = await configService.getConfig()

  const credIdx = await showCredsMenu(config.credentials, config.currentCredential)
  if (credIdx === -1) return

  config.currentCredential = credIdx

  await configService.storeConfig(config)

  try {
    StatusBar.startLoading()
    await connector.connect(config)
    toolingService.resetMetadataContainer()
    StatusBar.stopLoading()
    vscode.window.showInformationMessage('Credentials ok!')
  } catch (error) {
    StatusBar.stopLoading()
    vscode.window.showErrorMessage('Wrong credentials. Fix them to retry')
  }
}
