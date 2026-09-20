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
    
    # Remove both potentially wrong lines first
    content = content.replace('import ContractNav from "../../../../components/ContractNav";\n', '')
    content = content.replace('import ContractNav from "../../../components/ContractNav";\n', '')
    
    # Re-insert the correct one
    if 'ask' in fpath or 'diff' in fpath or 'graph' in fpath or 'obligations' in fpath or 'risk' in fpath or 'simulate' in fpath:
        content = content.replace('import Link from "next/link";', 'import ContractNav from "../../../../components/ContractNav";\nimport Link from "next/link";')
    else:
        # It's the root page.tsx
        content = content.replace('import Link from "next/link";', 'import ContractNav from "../../../components/ContractNav";\nimport Link from "next/link";')
        
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print('Imports fixed')
