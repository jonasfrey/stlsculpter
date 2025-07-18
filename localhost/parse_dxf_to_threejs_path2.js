async function() {

    function extractPathPoints(entities) {
        const points = [];
    
        for (const entity of entities) {
            if (entity.type === 'LINE') {
                const [start, end] = entity.vertices;
                points.push(new THREE.Vector3(start.x, start.y, start.z));
                points.push(new THREE.Vector3(end.x, end.y, end.z));
            }
    
            if (entity.type === 'ARC') {
                const { center, radius, startAngle, endAngle } = entity;
                const clockwise = endAngle < startAngle;
                const angleDiff = clockwise
                    ? startAngle - endAngle
                    : endAngle - startAngle;
                const segments = Math.max(8, Math.ceil(angleDiff / (Math.PI / 16)));
    
                for (let i = 0; i <= segments; i++) {
                    const angle = clockwise
                        ? startAngle - (i / segments) * angleDiff
                        : startAngle + (i / segments) * angleDiff;
    
                    const x = center.x + radius * Math.cos(angle);
                    const y = center.y + radius * Math.sin(angle);
                    points.push(new THREE.Vector3(x, y, center.z));
                }
            }
        }
    
        return points;
    }
    
    let s_texdt = await fetch('./splinesaspolylines.dxf')
        .then(response => response.text())
        .catch(error => console.error('Error loading SVG:', error));


const parser = new DxfParser();
try {
    const dxf = parser.parseSync(s_texdt);
    
    const dxfPoints = extractPathPoints(dxf.entities);
    const curve = new THREE.CatmullRomCurve3(dxfPoints);

    const shape = new THREE.Shape();
    shape.moveTo(0, 1);
    shape.lineTo(-1, -1);
    shape.lineTo(1, -1);
    shape.lineTo(0, 1);
    const segments = 100;
    const frames = curve.computeFrenetFrames(segments, true);
    const shapePoints = [
        new THREE.Vector2(0, 1),
        new THREE.Vector2(-1, -1),
        new THREE.Vector2(1, -1)
    ];
    
    const positions = [];
    const indices = [];
    
    for (let i = 0; i <= segments; i++) {
        const pt = curve.getPointAt(i / segments);
        const normal = frames.normals[i];
        const binormal = frames.binormals[i];
    
        for (let j = 0; j < shapePoints.length; j++) {
            const sp = shapePoints[j];
            const v = new THREE.Vector3()
                .copy(pt)
                .add(normal.clone().multiplyScalar(sp.x))
                .add(binormal.clone().multiplyScalar(sp.y));
    
            positions.push(v.x, v.y, v.z);
        }
    }
    for (let i = 0; i < segments; i++) {
        const a = i * 3;
        const b = a + 3;
    
        // 3 quads (each split into 2 triangles)
        indices.push(a, a + 1, b + 1);
        indices.push(a, b + 1, b);
    
        indices.push(a + 1, a + 2, b + 2);
        indices.push(a + 1, b + 2, b + 1);
    
        indices.push(a + 2, a, b);
        indices.push(a + 2, b, b + 2);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({ color: 0xff5533, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    return [
        mesh
    ]   


}catch(err) {
    return console.error(err.stack);
}
    

            }