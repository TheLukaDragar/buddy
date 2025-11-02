import os

#   return text
#     .toLowerCase()
#     .replace(/[^a-z0-9\s-]/g, '')
#     .trim()
#     .replace(/\s+/g, '-')
#     .replace(/-+/g, '-');
# }

import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = text.strip()
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text

# slugify all files in the directory
for file in os.listdir('.'):
    if file.endswith('png'):
        new_file = slugify(file.replace('.png', ''))
        os.rename(file, new_file + '.png')