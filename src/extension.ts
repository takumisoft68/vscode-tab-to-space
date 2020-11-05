// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// 半角文字は1文字、全角文字は2文字として文字数をカウントする
function getLen(str :string) :number {
    let length = 0;
    for(let i=0; i<str.length; i++) {
        let chr = str.charCodeAt(i);
        if( (chr >= 0x00 && chr <= 0x80) ||
            (chr >= 0xa0 && chr <= 0xff) ||
            (chr === 0xf8f0) ||
            (chr >= 0xff61 && chr <= 0xff9f) ||
            (chr >= 0xf8f1 && chr <= 0xf8f3)){
            //半角文字の場合は1を加算
            length += 1;
        }else{
            //それ以外の文字の場合は2を加算
            length += 2;
        }
    }
    //結果を返す
    return length;
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "markdowntable" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json

    function registerCommandNice(commandId: string, run: (...args: any[]) => void): void {
        let command = vscode.commands.registerCommand(commandId, run);
        context.subscriptions.push(command);
    }

    registerCommandNice('tabspace.convert', () => {
        // エディタ取得
        const editor = vscode.window.activeTextEditor as vscode.TextEditor;
        // ドキュメント取得
        const doc = editor.document;
        // ドキュメント全てを取得する
        const all_selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(doc.lineCount - 1, 10000));

        let tabSize = editor.options.tabSize as number;
        editor.edit(edit => {
            for (let i = 0; i < doc.lineCount; i++) {
                let text = doc.lineAt(i).text;

                while (text.indexOf('\t') != -1) {
                    let position = text.indexOf('\t');
                    let before = text.substr(0, position);
                    let beforeLen = getLen(before);
                    let spacenum = tabSize - (beforeLen % tabSize);
                    let texttemp = before + ' '.repeat(spacenum) + text.substr(position + 1);
                    text = texttemp;
                }

                // テキストを置換
                let selection = new vscode.Selection(new vscode.Position(i, 0), new vscode.Position(i, 10000));
                edit.replace(selection, text);
            }
        });
    });
}

// this method is called when your extension is deactivated
export function deactivate() { }
