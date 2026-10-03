import re

with open('server.ts', 'r') as f:
    code = f.read()

code = code.replace(r"\`Bearer \${apiKey}\`", "`Bearer ${apiKey}`")
code = code.replace(r"\`https://api.notion.com/v1/blocks/\${page.id}/children\${startCursor ? \`?start_cursor=\${startCursor}\` : ''}\`", "`https://api.notion.com/v1/blocks/${page.id}/children${startCursor ? `?start_cursor=${startCursor}` : ''}`")
code = code.replace(r"\`https://api.notion.com/v1/databases/\${childDbBlock.id}/query\`", "`https://api.notion.com/v1/databases/${childDbBlock.id}/query`")
code = code.replace(r"\`作品 \${idx + 1}\`", "`作品 ${idx + 1}`")

with open('server.ts', 'w') as f:
    f.write(code)
