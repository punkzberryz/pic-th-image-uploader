# Image Resizer & Uploader

A local web tool offering a streamlined drag-and-drop interface to automatically resize images, convert them to WebP, upload them to [pic.in.th](https://pic.in.th/), and track your upload history.

![Project Preview](https://placehold.co/600x400/1a1a1a/ffffff?text=Image+Uploader+Preview)

## Features

-   **Drag & Drop Interface**: Intuitive modern UI for easy file uploading.
-   **Auto-Optimization**: Automatically resizes images (max 1920px width) and converts them to efficient **WebP** format using `sharp`.
-   **Cloud Storage**: Seamless integration with `pic.in.th` API for hosting.
-   **History Tracking**: Locally saves a history of uploaded files (original name, URL, timestamp) using SQLite.
-   **Privacy**: All processing happens locally or directly via the `pic.in.th` secure API.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS + Framer Motion
-   **Database**: SQLite + Prisma ORM
-   **Image Processing**: Sharp
-   **Package Manager**: pnpm

## Getting Started

### Prerequisites

-   Node.js (LTS recommended)
-   `pnpm` (installed via `npm i -g pnpm`)

### Installation

1.  **Clone the repository** (or navigate to the project directory):
    ```bash
    cd image-uploader
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Setup Environment Variables**:
    Copy the example environment file and configure your API key.
    ```bash
    cp env.example .env
    ```
    Open `.env` and add your `pic.in.th` API key:
    ```env
    PIC_IN_TH_API_KEY=your_actual_api_key_here
    DATABASE_URL="file:./dev.db"
    ```

4.  **Initialize Database**:
    Run Prisma migration to set up the local SQLite database.
    ```bash
    npx prisma migrate dev --name init
    ```

### Running the App

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1.  Drag and drop an image file (JPG, PNG, etc.) onto the drop zone.
2.  The tool will process the image and upload it.
3.  Once successful, the link will appear, and the image will be added to the "Recent Uploads" list.
