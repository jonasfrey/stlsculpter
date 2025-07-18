async function() {

    function dxfToCurvePath(dxfEntities) {
        const curvePath = new THREE.CurvePath();
    debugger
        for (const entity of dxfEntities) {
            if (entity.type === "LINE") {
                const [start, end] = entity.vertices;
                const lineCurve = new THREE.LineCurve3(
                    new THREE.Vector3(start.x, start.y, start.z),
                    new THREE.Vector3(end.x, end.y, end.z)
                );
                curvePath.add(lineCurve);
            }
    
            else if (entity.type === "ARC") {
                const {
                    center, radius, startAngle, endAngle
                } = entity;
    
                // Convert ARC to multiple small line segments (or a curve)
                const arcPoints = [];
                const segments = 20;
                const angleDir = (endAngle > startAngle) ? 1 : -1;
                const angleLength = Math.abs(endAngle - startAngle);
                for (let i = 0; i <= segments; i++) {
                    const angle = startAngle + angleDir * (angleLength * i / segments);
                    arcPoints.push(new THREE.Vector3(
                        center.x + radius * Math.cos(angle),
                        center.y + radius * Math.sin(angle),
                        center.z
                    ));
                }
    
                // Turn into CatmullRomCurve
                const arcCurve = new THREE.CatmullRomCurve3(arcPoints);
                curvePath.add(arcCurve);
            }
        }
    
        return curvePath;
    }
    
    
    let s_texdt = await fetch('./dxf2.dxf')
        .then(response => response.text())
        .catch(error => console.error('Error loading SVG:', error));


const parser = new DxfParser();
try {
    const dxf = parser.parseSync(s_texdt);
    


    const pathCurve = dxfToCurvePath(dxf.entities); // your parsed DXF array

    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, 0);
    triangleShape.lineTo(1, 0);
    triangleShape.lineTo(0.5, 1);
    triangleShape.lineTo(0, 0);

    const extrudeSettings = {
        steps: 200,
        bevelEnabled: false,
        extrudePath: pathCurve
    };

    const geometry = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);

    return [
        mesh
    ]   


}catch(err) {
    return console.error(err.stack);
}
    

            }