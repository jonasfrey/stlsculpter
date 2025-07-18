async function() {

        
    let s_texdt = await fetch('./test.dxf')
        .then(response => response.text())
        .catch(error => console.error('Error loading SVG:', error));


const parser = new DxfParser();
try {
    const dxf = parser.parseSync(s_texdt);
    debugger
}catch(err) {
    return console.error(err.stack);
}
        return []
    

            }