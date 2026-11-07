Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = appDir

electronExe = appDir & "\node_modules\electron\dist\electron.exe"
mainScript = appDir & "\electron-main.cjs"

If fso.FileExists(electronExe) Then
    WshShell.Run """" & electronExe & """ """ & mainScript & """", 0, False
Else
    WshShell.Run "cmd /c npm run app", 0, False
End If
