"""
Топ игроков кликера: GET — получить список, POST — сохранить результат.
v2
"""
import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT name, total_clicks, multiplier, achievements_count, created_at
            FROM leaderboard
            ORDER BY total_clicks DESC
            LIMIT 100
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        players = [
            {
                'name': r[0],
                'total_clicks': r[1],
                'multiplier': r[2],
                'achievements_count': r[3],
                'created_at': r[4].isoformat() if r[4] else None,
            }
            for r in rows
        ]
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'players': players}),
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = str(body.get('name', 'Аноним')).strip()[:30] or 'Аноним'
        total_clicks = int(body.get('total_clicks', 0))
        multiplier = int(body.get('multiplier', 1))
        achievements_count = int(body.get('achievements_count', 0))

        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO leaderboard (name, total_clicks, multiplier, achievements_count)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (name)
            DO UPDATE SET
                total_clicks = GREATEST(leaderboard.total_clicks, EXCLUDED.total_clicks),
                multiplier = EXCLUDED.multiplier,
                achievements_count = EXCLUDED.achievements_count,
                created_at = NOW()
        """, (name, total_clicks, multiplier, achievements_count))
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
        }

    return {'statusCode': 405, 'headers': cors, 'body': 'Method Not Allowed'}