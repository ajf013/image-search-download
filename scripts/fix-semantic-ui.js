const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', 'semantic-ui-css', 'semantic.min.css');

try {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('charset=utf-8;;base64')) {
            content = content.replace('charset=utf-8;;base64', 'charset=utf-8;base64');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Fixed semantic-ui-css double semicolon issue.');
        } else {
            console.log('semantic-ui-css already fixed or issue not found.');
        }
    } else {
        console.warn('semantic-ui-css/semantic.min.css not found, skipping fix.');
    }
} catch (error) {
    console.error('Error fixing semantic-ui-css:', error);
    process.exit(1);
}
