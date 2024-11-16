from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from pdf2docx import Converter
import fitz  # PyMuPDF
import os
import logging
from werkzeug.utils import secure_filename
import tempfile
import traceback

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'temp'
ALLOWED_EXTENSIONS = {'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/convert', methods=['POST'])
def convert_pdf_to_word():
    try:
        logger.info("Starting conversion request")

        # Check if file exists in request
        if 'file' not in request.files:
            logger.error("No file part in request")
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        logger.info(f"Received file: {file.filename}")

        # Check if file was selected
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({'error': 'No selected file'}), 400

        # Check file type
        if not allowed_file(file.filename):
            logger.error(f"Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type'}), 400

        try:
            # Create temporary files
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as pdf_temp:
                logger.info(f"Created temporary PDF file: {pdf_temp.name}")
                file.save(pdf_temp.name)

            docx_temp = tempfile.NamedTemporaryFile(suffix='.docx', delete=False)
            docx_path = docx_temp.name
            docx_temp.close()
            logger.info(f"Created temporary DOCX file: {docx_path}")

            try:
                # Convert PDF to DOCX
                logger.info("Starting PDF to DOCX conversion")
                cv = Converter(pdf_temp.name)
                cv.convert(docx_path)
                cv.close()
                logger.info("Conversion completed successfully")

                # Send the converted file
                return send_file(
                    docx_path,
                    mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    as_attachment=True,
                    download_name=f"{os.path.splitext(secure_filename(file.filename))[0]}.docx"
                )

            except Exception as conv_error:
                logger.error(f"Conversion error: {str(conv_error)}")
                logger.error(traceback.format_exc())
                return jsonify({'error': f'Conversion error: {str(conv_error)}'}), 500

            finally:
                # Cleanup temporary files
                try:
                    os.unlink(pdf_temp.name)
                    os.unlink(docx_path)
                    logger.info("Temporary files cleaned up")
                except Exception as cleanup_error:
                    logger.error(f"Cleanup error: {str(cleanup_error)}")

        except Exception as temp_file_error:
            logger.error(f"Temporary file error: {str(temp_file_error)}")
            logger.error(traceback.format_exc())
            return jsonify({'error': f'Temporary file error: {str(temp_file_error)}'}), 500

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/extract_text', methods=['POST'])
def extract_text_from_pdf():
    try:
        logger.info("Starting text extraction request")

        # Check if file exists in request
        if 'file' not in request.files:
            logger.error("No file part in request")
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        logger.info(f"Received file: {file.filename}")

        # Check if file was selected
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({'error': 'No selected file'}), 400

        # Check file type
        if not allowed_file(file.filename):
            logger.error(f"Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type'}), 400

        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as pdf_temp:
                logger.info(f"Created temporary PDF file: {pdf_temp.name}")
                file.save(pdf_temp.name)

            try:
                # Extract text from PDF
                logger.info("Starting text extraction from PDF")
                pdf_document = fitz.open(pdf_temp.name)
                text = ""
                for page_num in range(len(pdf_document)):
                    page = pdf_document.load_page(page_num)
                    text += page.get_text()
                pdf_document.close()
                logger.info("Text extraction completed successfully")

                # Send the extracted text
                return jsonify({'text': text}), 200

            except Exception as extract_error:
                logger.error(f"Text extraction error: {str(extract_error)}")
                logger.error(traceback.format_exc())
                return jsonify({'error': f'Text extraction error: {str(extract_error)}'}), 500

            finally:
                # Cleanup temporary file
                try:
                    os.unlink(pdf_temp.name)
                    logger.info("Temporary file cleaned up")
                except Exception as cleanup_error:
                    logger.error(f"Cleanup error: {str(cleanup_error)}")

        except Exception as temp_file_error:
            logger.error(f"Temporary file error: {str(temp_file_error)}")
            logger.error(traceback.format_exc())
            return jsonify({'error': f'Temporary file error: {str(temp_file_error)}'}), 500

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
