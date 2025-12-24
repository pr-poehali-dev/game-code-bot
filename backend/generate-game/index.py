import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Генерирует код игры через Google Gemini API на основе промпта пользователя
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_str = event.get('body', '{}')
    if not body_str or body_str.strip() == '':
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Prompt is required'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(body_str)
        prompt = body_data.get('prompt', '')
        complexity = body_data.get('complexity', 2)
        
        if not prompt:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Prompt is required'}),
                'isBase64Encoded': False
            }
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid JSON in request body'}),
            'isBase64Encoded': False
        }
    
    try:
        
        gemini_api_key = os.environ.get('GEMINI_API_KEY')
        if not gemini_api_key:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'GEMINI_API_KEY not configured'}),
                'isBase64Encoded': False
            }
        
        import google.generativeai as genai
        
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        system_prompt = f"""Ты - эксперт по созданию браузерных игр. Создай полностью рабочую HTML5 игру на основе описания пользователя.

ТРЕБОВАНИЯ:
- Один HTML файл со встроенным CSS и JavaScript
- Уровень сложности: {complexity}/5
- Киберпанк стиль: темный фон (#0a0e27), неоновые цвета (#00ff41 зеленый, #9b87f5 фиолетовый, #0EA5E9 голубой)
- Canvas для графики или DOM элементы
- Управление через клавиатуру/мышь
- Счет и игровая логика
- Адаптивный дизайн

Описание игры: {prompt}

Верни ТОЛЬКО готовый HTML код без объяснений и markdown разметки."""
        
        response = model.generate_content(system_prompt)
        game_code = response.text
        
        game_code = game_code.replace('```html', '').replace('```', '').strip()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'code': game_code,
                'prompt': prompt,
                'complexity': complexity
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }