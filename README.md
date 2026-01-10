# Naraka Character Editor

A web-based tool for editing Naraka: Bladepoint character customization data. This application allows users to import character data from QR codes, modify detailed parameters, manage presets, and export the changes back to a QR code for use in the game.

**Access the tool here:** [https://freehuntx.github.io/naraka-char-editor](https://freehuntx.github.io/naraka-char-editor)

> Disclaimer: This project is heavily vibe-coded using Gemini 3 Pro

## Features

### Import and Export
*   **QR Code Import:** Load character data by dragging and dropping a generic Naraka character QR code image, by selecting a file from your device or by screenshot the game window (with visible qr code).
*   **QR Code Generation:** After making edits, generate a new QR code image that can be imported back into Naraka: Bladepoint.

### Editing Capabilities
*   **Comprehensive Parameter Editing:** Modify a wide range of character attributes including face structure, makeup, and body parameters.
*   **Hair Customization:** detailed editing of hair parameters and styles.
*   **JSON Editor:** A built-in JSON editor allows for direct manipulation of the underlying data structure for advanced users who want fine-grained control over every value.

### Preset Management
*   **Save and Load:** Create your own presets from the current character state.
*   **Smart Apply:** Apply specific parts of a preset to your current character. This feature intelligently merges face data while preserving other attributes like Hero ID or Hair settings, allowing you to mix and match features from different characters.

## Usage

1.  **Open the Application:** Navigate to the hosted website.
2.  **Import Data:** Import a character qr code by one of the mentioned methods.
3.  **Edit:** Use the JSON view for direct data editing.
4.  **Save/Manage Presets:** Use the preset sidebar to save your current look or apply previously saved configurations.
5.  **Export:** Click the "Export QR" button to generate the final image. Save this image and import it within the Naraka: Bladepoint character customization menu.

## Development

If you wish to run this project locally or contribute to its development:

### Prerequisites
*   bun
*   npm

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/freehuntx/naraka-char-editor.git
cd naraka-char-editor
bun install
```

### Running Locally

Start the development server:

```bash
bun run dev
```

### Building
w
Build the production version:

```bash
bun run build
```
