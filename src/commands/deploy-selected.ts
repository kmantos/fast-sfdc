import deploy from './deploy'
import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'

const basePath = path.join(vscode.workspace.rootPath as string, 'src') + '/'
const isInContext = (uri: vscode.Uri) => uri.path.startsWith(basePath)
const isFolder = (p: string) => fs.statSync(path.resolve(vscode.workspace.rootPath || '', 'src', p)).isDirectory()

export default function deploySelected (uri: vscode.Uri, allUris: vscode.Uri[], destructive = false) {
  if (allUris && allUris.length) {
    deploy(false, destructive, allUris
      .filter(x => isInContext(x))
      .map(x => x.path.substring(basePath.length))
      .map(x => isFolder(x) ? x + '/**/*' : x))
  } else if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
    const fileName = vscode.window.activeTextEditor.document.fileName
    if (isInContext(vscode.Uri.file(fileName))) {
      deploy(false, destructive, [fileName.substring(basePath.length)])
    }
  }
}
