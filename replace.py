import os
import re

files = [
    r'web\app\contracts\[id]\page.tsx',
    r'web\app\contracts\[id]\ask\page.tsx',
    r'web\app\contracts\[id]\diff\page.tsx',
    r'web\app\contracts\[id]\graph\page.tsx',
    r'web\app\contracts\[id]\obligations\page.tsx',
    r'web\app\contracts\[id]\risk\page.tsx',
    r'web\app\contracts\[id]\simulate\page.tsx'
]

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add import if not exists
    if 'ContractNav' not in content:
        content = content.replace('import Link from \"next/link\";', 'import ContractNav from \"../../../../components/ContractNav\";\nimport Link from \"next/link\";')
        # for page.tsx which is a level higher
        content = content.replace('import Link from \"next/link\"', 'import ContractNav from \"../../../components/ContractNav\";\nimport Link from \"next/link\"')
        
    # 2. Replace the flex nav div
    # This regex looks for <div className="flex gap-4"> or similar containing Links
    pattern = re.compile(r'<div className=\"flex(?:[^>]*?)gap-4(?:[^>]*?)\">(?:.*?)</Link>\s*</div>', re.DOTALL)
    
    # Check if we use params.id or contract.id
    if 'contract.id' in content and 'params.id' not in content:
        replacement = '<ContractNav contractId={contract.id} />'
    else:
        replacement = '<ContractNav contractId={params.id} />'
        
    new_content = pattern.sub(replacement, content)
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)
print('Done nav replacement')
