'use strict'
import * as vscode from 'vscode'
import cmds from './commands'
import statusBar from './statusbar'
import configService from './services/config-service'
import logger from './logger'
import CodeLensRunTest from './codelens-provider/codelens-run-test'

const activateExtension = () => {
  const isOneWorkspaceOpened = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1
  vscode.commands.executeCommand('setContext', 'fast-sfdc-active', isOneWorkspaceOpened)
  if (!isOneWorkspaceOpened) {
    statusBar.hideStatusBar()
    vscode.commands.executeCommand('setContext', 'fast-sfdc-configured', false)
    vscode.commands.executeCommand('setContext', 'fast-sfdc-more-credentials', false)
  } else {
    statusBar.initStatusBar()
    const cfg = configService.getConfigSync()
    vscode.commands.executeCommand('setContext', 'fast-sfdc-configured', cfg.stored)
    vscode.commands.executeCommand('setContext', 'fast-sfdc-more-credentials', cfg.credentials.length > 2)
    logger.appendLine('Extension "fast-sfdc" is now active!')
  }
}

export function activate (ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => activateExtension()))
  ctx.subscriptions.push(vscode.workspace.onDidSaveTextDocument(textDocument => cmds.compile(textDocument)))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.enterCredentials', cmds.credentials))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.replaceCredentials', cmds.credentials))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.addCredentials', () => cmds.credentials(true)))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.changeCredentials', cmds.changeCredentials))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.removeCredentials', cmds.removeCredentials))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.createMeta', cmds.createMeta))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.executeAnonymous', cmds.executeAnonymous))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.createAuraDefinition', cmds.createAuraDefinition))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.retrieve', cmds.retrieve))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.retrieveProfiles', () => cmds.retrieve(['profiles/**/*'])))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.retrieveSelected', cmds.retrieveSelected))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.deploy', cmds.deploy))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.validate', () => cmds.deploy(true)))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.retrieveSingle', cmds.retrieveSelected))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.configureStaticResourceBundles', cmds.configureStaticResourceBundles))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.deploySingle', cmds.deploySelected))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.deploySelected', cmds.deploySelected))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.destroySelected', cmds.destroySelected))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.toggleOutputWindowVisibility', cmds.toggleOutputWindowVisibility))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.runTest', cmds.runTest))
  ctx.subscriptions.push(vscode.commands.registerCommand('FastSfdc.initSfdy', cmds.initSfdy))
  ctx.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: 'apex', scheme: 'file' }, new CodeLensRunTest()))
  activateExtension()
}
