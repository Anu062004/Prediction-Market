import json
from pathlib import Path

# Placeholder training: write a simple config file
if __name__ == '__main__':
    Path('models').mkdir(exist_ok=True)
    with open('models/baseline.json','w') as f:
        json.dump({"model": "baseline", "version": "0.1"}, f)
    print('Saved models/baseline.json')
