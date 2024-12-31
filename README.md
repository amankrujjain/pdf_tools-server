<<<<<<< HEAD
# PDF Tools

This project provides an API to convert DOC files to PDF using Node.js, Express, and LibreOffice.

## Project Structure

- `controllers/convertDocToPdfConverter.js`: Handles the conversion request and response.
- `routes/docToPdfRoute.js`: Defines the route for the DOC to PDF conversion.
- `services/convertDocToPdf.js`: Contains the logic to convert DOC files to PDF using LibreOffice.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-repo/pdf-tools.git
    cd pdf-tools
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Ensure LibreOffice is installed on your system. The default path used in the code is `C:\\Program Files\\LibreOffice\\program\\soffice.exe`. Adjust this path if LibreOffice is installed in a different location.

## Usage

1. Start the server:
    ```sh
    npm start
    ```

2. Send a POST request to `/doc-to-pdf` with a DOC file using a tool like Postman or curl:
    ```sh
    curl -F "file=@/path/to/your/document.doc" http://localhost:3000/doc-to-pdf
    ```

## API Endpoints

### POST /doc-to-pdf

#### Request

- **Content-Type**: `multipart/form-data`
- **Body**: A DOC file with the key [file](http://_vscodecontentref_/1).

#### Response

- **Success (200)**:
    ```json
    {
        "success": true,
        "message": "File converted successfully",
        "data": {
            "originalFile": "document.doc",
            "convertedFile": "document.pdf",
            "convertedFilePath": "/path/to/converted/document.pdf"
        }
    }
    ```

- **Failure (400)**: Unsupported file type
    ```json
    {
        "success": false,
        "message": "Unsupported file type. Only .doc and .docx files are allowed."
    }
    ```

- **Failure (500)**: General error
    ```json
    {
        "success": false,
        "message": "Error message describing the failure"
    }
    ```

## License

This project is licensed under the MIT License.
=======
# pdf_tools-server
>>>>>>> a58c448d40638169fac6c32343ba8e1b26f62be4
