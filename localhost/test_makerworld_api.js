let o_body = {
    "title": "",
    "profileTitle": "0.2mm layer, 2 walls, 15% infill",
    "summary": "",
    "profileSummary": "",
    "categoryId": null,
    "tags": [],
    "cover": "",
    "profileCover": "",
    "nsfw": false,
    "modelId": "",
    "profileId": 0,
    "license": "Standard Digital File License",
    "region": "",
    "modelSource": "original",
    "original": [],
    "auxiliaryPictures": [],
    "auxiliaryBom": [],
    "auxiliaryGuide": [],
    "auxiliaryOther": [],
    "designBom": [],
    "designGuide": [],
    "designOther": [],
    "designPictures": [],
    "details": [
        "https://public-stage.bblmw.com/makerworld/user/1450570084/draft/2025-04-28_efdbaa9662987.png"
    ],
    "model3Mf": {
        "name": "earrings_tangent_circles_3.3mf",
        "size": 1937678,
        "url": "https://public-stage.bblmw.com/makerworld/user/1450570084/draft/2025-04-28_87a31e4a68593.3mf"
    },
    "otherCompatibility": [
        {
            "devModelName": "C11",
            "devProductName": "P1P",
            "nozzleDiameter": 0.4
        },
        {
            "devModelName": "BL-P002",
            "devProductName": "X1",
            "nozzleDiameter": 0.4
        },
        {
            "devModelName": "BL-P001",
            "devProductName": "X1 Carbon",
            "nozzleDiameter": 0.4
        },
        {
            "devModelName": "C13",
            "devProductName": "X1E",
            "nozzleDiameter": 0.4
        },
        {
            "devModelName": "N2S",
            "devProductName": "A1",
            "nozzleDiameter": 0.4
        },
        {
            "devModelName": "O1D",
            "devProductName": "H2D",
            "nozzleDiameter": 0.4
        }
    ],
    "modelFiles": [],
    "tempDetails": [
        {
            "name": "2025-04-28_efdbaa9662987.png",
            "url": "https://public-stage.bblmw.com/makerworld/user/1450570084/draft/2025-04-28_efdbaa9662987.png"
        }
    ],
    "picturesIsUploading": false,
    "accessoriesIsUploading": false,
    "profilePicturesIsUploading": false,
    "templateFileIsUploading": false,
    "modelDetailIsUploading": false,
    "mode": "uploadFile",
    "clickWhich": "next",
    "rawModelFileIsUploading": false,
    "uploading3mfStatus": 2,
    "designSetting": {
        "submitAsPrivate": false,
        "makerLab": "",
        "makerLabVersion": ""
    },
    "draftSetting": {
        "createStep": "",
        "createWith3mf": true,
        "customGCode": false
    },
    "instanceSetting": {
        "submitAsPrivate": false,
        "isPrinterPresetChanged": false,
        "isPrinterTested": false,
        "isDonateToAuthor": false,
        "makerLab": "",
        "makerLabVersion": ""
    },
    "bomsNeeded": false,
    "boms": [],
    "bomsOfFilaments": [],
    "coverPortrait": "",
    "coverIsUploading": false,
    "appCoverIsUploading": false,
    "bomsOfOtherPartList": [],
    "syncToMWGlobal": true,
    "cyberBrick": {
        "cyberBrickNeeded": false,
        "controlConfig": [],
        "motionConfig": [],
        "mainControlConfig": {
            "uniKey": "",
            "name": "",
            "size": 0,
            "url": ""
        },
        "isOfficialController": true,
        "controllerCover": {
            "name": "",
            "url": ""
        },
        "switchCovers": []
    },
    "rcControlConfigIsUploading": false,
    "rcMotionFileIsUploading": false,
    "rcMainControlConfigIsUploading": "",
    "rcControllerCoverIsUploading": false,
    "rcSwitchesCoverIsUploading": false,
    "topNavigationArr": [
        {
            "label": "Upload",
            "step": "upload",
            "status": 2,
            "link": ""
        },
        {
            "label": "Model Information",
            "step": "model_information",
            "status": 0,
            "link": ""
        },
        {
            "label": "Print Profile Information",
            "step": "print_profile",
            "status": 0,
            "link": ""
        }
    ],
    "scadIsVaildating": false,
    "compatibility": {
        "devModelName": "C12",
        "devProductName": "P1S",
        "nozzleDiameter": 0.4
    },
    "unsupportedDevModels": [],
    "printer": {
        "model": "Bambu Lab P1S",
        "variant": 0.4,
        "settingsId": "Bambu Lab P1S 0.4 nozzle"
    },
    "makerLabSvg": []
}
let o_resp = await fetch("https://makerworld.com/api/v1/design-service/my/draft", {
  "headers": {
    "content-type": "application/json",
    "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "x-bbl-app-source": "makerworld",
    "x-bbl-client-type": "web",
    "x-bbl-client-version": "00.00.00.01"
  },
  "referrer": "https://makerworld.com/en/my/models/publish?type=original",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": JSON.stringify(o_body),
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
});
console.log(o_resp)