# Shadow Study Extension

Version: 1.1.0

### New Features
1. Multiple Date Support
   - Add multiple dates
   - Preview any selected date from multiple dates

2. Specific Time Support
   - Direct selection of specific moment in time

3. Export Updates
   - Export multiple dates at once
      • Organized folder structure by date
   - Export time range as animated GIF
   - Export specific moment in time

4. UI Updates
   - Organized into sections

[Screenshot of new UI]

## Extension Development Questions

### 1. Viewport Flashing During Batch Image Captures
When using the Forma camera API's capture() method for exports, I'm encountering a viewport issue: 

I noticed that during time range exports (in both the original extension and this version), as well as GIF exports in this version, each sun.setDate() and camera.capture() call causes visible viewport flashing. It would be great to address this in the update if possible.

Question:
- Are there any API methods available to minimize visual disruption for the user?

**Update:** The Forma team has addressed this issue by adding a loading spinner during batch captures. We've removed our temporary warning message solution.

#### Viewport Flashing Mitigation Strategies
I explored several approaches to address the viewport flashing issue during batch exports:

1. **Warning Message (Implemented Initially)**
   - Added a warning dialog before starting batch exports
   - Informs users about potential photosensitive concerns
   - Gives users the option to proceed or cancel
   - Simple implementation that doesn't interfere with the Forma API

2. **Viewport Overlay (Attempted)**
   - Tried creating a semi-transparent overlay to cover the Forma viewport during exports
   - Attempted to position it over just the 3D viewport area as well as the full browser window
   - Failed because:
     - Extension runs in a sandboxed iframe with limited access to parent window
     - Cannot position elements outside our extension's iframe
     - Any overlay is confined to our sidebar panel
     - Cross-origin restrictions prevent accessing the main Forma application DOM

3. **Minimize Viewport (Attempted)**
   - Tried to temporarily reduce the viewport size during export
   - Attempted to modify viewport CSS or move it off-screen
   - Failed because:
     - No API access to modify the main Forma viewport
     - Extension runs in a sidebar iframe with limited access to parent
     - Forma's viewport is managed by the core application

The warning message approach was a reasonable temporary solution that:
- Addressed accessibility concerns
- Didn't interfere with Forma's rendering pipeline
- Gave users control over whether to proceed
- Worked within the current API constraints

A more robust solution required Forma API enhancements to support "silent" captures without viewport updates, which the Forma team has now implemented.

### 2. Extension Icons and Manifest Implementation
Based on reviewing the Forma publishing documentation and original repository (which I noticed doesn't include a manifest.json), it looks like the extension icons and manifest.json might be handled during the publishing process rather than being required during development. I tried several approaches to get the icons to display during development but was unsuccessful.

Question:
- Is this the correct understanding about how extension icons and manifest.json are handled?

**Response:** "You are right that the information and icon for the extension is managed on the App store page. This is only accessible if you are the owner of the extension. As an owner, in order to get access to this page, you need to send us an email with the extension id so we can enable it."

**Note:** Since we're submitting this as an update to the existing Shadow study extension in the main repository, we don't need to handle icon publishing as the extension already exists with its icon. We did make minor adjustments to the icon padding/spacing for improved visual appearance.