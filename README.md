# FidelRead v1.1 - Android Build Instructions

This repository contains the complete source code for the "FidelRead" React Native application. All development work is complete. This document provides the instructions for a developer to compile the final Android `.apk` file.

## Phase 1: Project Setup

1.  **Clone or Download:** Clone this repository or download it as a ZIP file.
2.  **Navigate to Directory:** In your terminal, `cd` into the project directory.
3.  **Install Dependencies:** Run the following command to install all required libraries:
    ```bash
    npm install
    ```
    *(Note: The `package.json` file contains all the necessary dependencies).*

## Phase 2: Native Android Configuration

1.  **Check Permissions:** Ensure that `android/app/src/main/AndroidManifest.xml` contains the necessary permissions for `INTERNET`, `CAMERA`, etc.
2.  **Add OCR Language Data:**
    *   Download `amh.traineddata` from: [https://github.com/tesseract-ocr/tessdata_fast/raw/main/amh.traineddata](https://github.com/tesseract-ocr/tessdata_fast/raw/main/amh.traineddata)
    *   Download `eng.traineddata` from: [https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata](https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata)
    *   Create the directory: `android/app/src/main/assets/tessdata`.
    *   Place both `.traineddata` files inside it.
3.  **Configure Vector Icons:** Make sure the `android/app/build.gradle` file has this line at the top: `apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"`

## Phase 3: Secure API Key

The app requires a secure URL for its Text-to-Speech function.

*   **The project owner will provide you with a temporary API URL.**
*   In the files `OcrScannerScreen.js` and `HistoryDetailScreen.js`, find the `TTS_FUNCTION_URL` constant and replace the placeholder with the real URL.
*   **IMPORTANT:** Do not commit the real API key back to this public repository.

## Phase 4: Final Build

1.  **Test the Debug App:** Connect an Android device or emulator and run `npx react-native run-android`.
2.  **Generate the Release APK:**
    *   Follow the standard React Native documentation to [generate a release signing key](https://reactnative.dev/docs/signed-apk-android#generating-a-signing-key).
    *   Configure Gradle to use the signing key.
    *   Navigate to the `android` directory (`cd android`).
    *   Run the command: `./gradlew assembleRelease`
3.  **Deliver the File:** The final, signed app file will be located at `android/app/build/outputs/apk/release/app-release.apk`. Please send this file to the project owner.
