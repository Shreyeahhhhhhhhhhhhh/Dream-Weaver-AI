import os
import uuid
from flask import Flask, request, jsonify, render_template
import ollama
from gtts import gTTS

app = Flask(__name__, template_folder='templates', static_folder='static')

audio_dir = os.path.join('static', 'audio')
if not os.path.exists(audio_dir):
    os.makedirs(audio_dir)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate-story', methods=['POST'])
def generate_story():
    try:
        prompt = request.json.get('prompt')
        if not prompt:
            return jsonify({'error': 'Prompt is missing.'}), 400

        story_prompt = f"Write a 4-page children's story about '{prompt}'. Keep each page to a single, short paragraph. Separate each page with '[PAGE_BREAK]'."

        response = ollama.chat(
            model='gemma:2b', # Using the gemma:2b model
            messages=[{'role': 'user', 'content': story_prompt}]
        )

        story_text = response['message']['content'].strip()

        print("--- RAW STORY OUTPUT FROM MODEL ---")
        print(story_text)
        print("---------------------------------")

        pages_text = [p.strip() for p in story_text.split('[PAGE_BREAK]') if p.strip()]

        if len(pages_text) <= 1:
            pages_text = [p.strip() for p in story_text.split('\n\n') if p.strip()]

        if not pages_text:
            return jsonify({'error': 'Failed to parse story text into pages.'}), 500

        story_pages = []

        for i, text in enumerate(pages_text):
            page_data = {'text': text}
            page_data['image_url'] = f"https://picsum.photos/seed/{uuid.uuid4()}/1024/1024"

            audio_filename = f"{uuid.uuid4()}.mp3"
            audio_filepath = os.path.join(audio_dir, audio_filename)

            tts = gTTS(text=text, lang='en', slow=False)
            tts.save(audio_filepath)

            page_data['audio_url'] = f"/static/audio/{audio_filename}"
            story_pages.append(page_data)

        return jsonify({'pages': story_pages})

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': 'An internal server error occurred.'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)