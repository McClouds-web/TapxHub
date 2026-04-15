import os
import re

dir_path = '/Users/tapiwamakore/.gemini/antigravity/scratch/TapxHubRecent/src'

for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css', '.html')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            new_content = content
            # Replace teal/green colors with blue/sky/indigo
            new_content = re.sub(r'#28c2b5', '#3b82f6', new_content, flags=re.IGNORECASE)  # teal to blue-500
            new_content = re.sub(r'#10b981', '#3b82f6', new_content, flags=re.IGNORECASE)  # emerald-500 to blue-500
            new_content = re.sub(r'emerald-', 'blue-', new_content)
            new_content = re.sub(r'green-', 'blue-', new_content)
            new_content = re.sub(r'text-emerald', 'text-blue', new_content)
            new_content = re.sub(r'bg-emerald', 'bg-blue', new_content)
            new_content = re.sub(r'border-emerald', 'border-blue', new_content)
            
            # Replace Matrix
            new_content = re.sub(r'Core Matrix', 'Core System', new_content)
            new_content = re.sub(r'matrix', 'system', new_content)
            new_content = re.sub(r'Matrix', 'System', new_content)
            new_content = re.sub(r'MATRIX', 'SYSTEM', new_content)

            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
print("Replacement completed.")
