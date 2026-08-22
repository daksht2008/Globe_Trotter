import sys
from app import create_app
from app.models import db
from app.utils.seed import seed_database

app = create_app()

with app.app_context():
    db.create_all()
    if len(sys.argv) > 1 and sys.argv[1] == 'seed':
        seed_database()

if __name__ == '__main__':
    with app.app_context():
        seed_database()  # Auto-seed on standalone run if not already seeded
    app.run(host='0.0.0.0', port=app.config['PORT'], debug=True)
