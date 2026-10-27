// Identité du pilote Weechat à reporter dans softcam/src/softcam/softcam.cpp.
// Ne pas changer le CLSID après publication : il doit rester identique
// à desktop/src-tauri/src/virtual_camera.rs (CLSID).
#include <windows.h>

// {6E8C4F2A-9B3D-4E71-A5C2-7D1F0B8E3A64}
const GUID CLSID_WeechatVirtualCamera =
    {0x6e8c4f2a, 0x9b3d, 0x4e71, {0xa5, 0xc2, 0x7d, 0x1f, 0x0b, 0x8e, 0x3a, 0x64}};

const wchar_t FILTER_NAME[] = L"Weechat Virtual Camera";
