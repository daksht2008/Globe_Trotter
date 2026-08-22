import os
import sys
from app import create_app
from app.models import db
from app.utils.seed import seed_database

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if len(sys.argv) > 1 and sys.argv[1] == 'seed':
            seed_database()
        else:
            seed_database()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

