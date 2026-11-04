; Weechat-Setup.exe — installateur tout-en-un (Inno Setup 6)
[Setup]
AppName=Weechat Swap Live
AppVersion=0.2.0
AppPublisher=Weechat
DefaultDirName={autopf}\Weechat
DefaultGroupName=Weechat
OutputDir=..\..\dist-installer
OutputBaseFilename=Weechat-Setup
Compression=lzma2
SolidCompression=yes
DiskSpanning=no
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin
WizardStyle=modern

[Languages]
Name: "fr"; MessagesFile: "compiler:Languages\French.isl"

[Files]
Source: "dist\Weechat\*"; DestDir: "{app}"; Flags: recursesubdirs ignoreversion
Source: "build-assets\vcam\UnityCaptureFilter64.dll"; DestDir: "{app}\vcam"; Flags: ignoreversion 64bit
Source: "build-assets\vcam\UnityCaptureFilter32.dll"; DestDir: "{app}\vcam"; Flags: ignoreversion 32bit

[Icons]
Name: "{group}\Weechat Swap Live"; Filename: "{app}\Weechat.exe"
Name: "{autodesktop}\Weechat Swap Live"; Filename: "{app}\Weechat.exe"

[Run]
; Register the virtual camera under the brand name shown in WhatsApp, Facebook, TikTok, Zoom, Meet.
Filename: "{sys}\regsvr32.exe"; Parameters: "/s ""/i:UnityCaptureName=Weechat Camera"" ""{app}\vcam\UnityCaptureFilter64.dll"""; Flags: runhidden waituntilterminated; Check: IsWin64
Filename: "{syswow64}\regsvr32.exe"; Parameters: "/s ""/i:UnityCaptureName=Weechat Camera"" ""{app}\vcam\UnityCaptureFilter32.dll"""; Flags: runhidden waituntilterminated
Filename: "{app}\Weechat.exe"; Description: "Lancer Weechat Swap Live"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "{sys}\regsvr32.exe"; Parameters: "/u /s ""{app}\vcam\UnityCaptureFilter64.dll"""; Flags: runhidden; RunOnceId: "UnregVcam64"
Filename: "{syswow64}\regsvr32.exe"; Parameters: "/u /s ""{app}\vcam\UnityCaptureFilter32.dll"""; Flags: runhidden; RunOnceId: "UnregVcam32"
