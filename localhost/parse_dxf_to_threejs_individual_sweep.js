async function() {

    
    let s_texdt = await fetch('./frontplanesketch.dxf')
        .then(response => response.text())
        .catch(error => console.error('Error loading SVG:', error));


const parser = new DxfParser();
try {
    const dxf = parser.parseSync(s_texdt);
    
    // the dxf object looks like this
//      {
//     "header":{...},
//     "tables": {...},
//     "blocks": {...},
//     "entities": [
//         {
//             "type": "LINE",
//             "vertices": [
//                 {
//                     "x": -15.6454611569643,
//                     "y": 0,
//                     "z": 0
//                 },
//                 {
//                     "x": 0,
//                     "y": 0,
//                     "z": 0
//                 }
//             ],
//             "handle": "10000057",
//             "ownerHandle": "1F",
//             "layer": "MODELSKETCH_VISIBLE"
//         },
//         {
//             "type": "LINE",
//             "vertices": [
//                 {
//                     "x": -15.6454611569643,
//                     "y": 2.606524154543877,
//                     "z": 0
//                 },
//                 {
//                     "x": -15.6454611569643,
//                     "y": 0,
//                     "z": 0
//                 }
//             ],
//             "handle": "1000005B",
//             "ownerHandle": "1F",
//             "layer": "MODELSKETCH_VISIBLE"
//         },
//         {
//             "type": "ARC",
//             "handle": "1000005F",
//             "ownerHandle": "1F",
//             "layer": "MODELSKETCH_VISIBLE",
//             "center": {
//                 "x": -15.6454611569643,
//                 "y": 10.17081458121538,
//                 "z": 0
//             },
//             "radius": 7.564290426671505,
//             "startAngle": 4.71238898038469,
//             "endAngle": 0,
//             "angleLength": -4.71238898038469
//         },
//         {
//             "type": "LINE",
//             "vertices": [
//                 {
//                     "x": -5.654461612026642,
//                     "y": 10.17081458121538,
//                     "z": 0
//                 },
//                 {
//                     "x": -8.081170730292797,
//                     "y": 10.17081458121538,
//                     "z": 0
//                 }
//             ],
//             "handle": "10000063",
//             "ownerHandle": "1F",
//             "layer": "MODELSKETCH_VISIBLE"
//         },
//         {
//             "type": "LINE",
//             "vertices": [
//                 {
//                     "x": 5.654461612026641,
//                     "y": 10.17081458121538,
//                     "z": 0
//                 },
//                 {
//                     "x": 8.081170730292797,
//                     "y": 10.17081458121538,
//                     "z": 0
//                 }
//             ],
//             "handle": "10000067",
//             "ownerHandle": "1F",
//             "layer": "MODELSKETCH_VISIBLE"
//         },
//         {
//             "type": "ARC",
//             "handle": "1000006B",
//             "ownerHandle": "1F",
//             "layer": "MODELSKETCH_VISIBLE",
//             "center": {
//                 "x": -2.74066795827821,
//                 "y": 10.17081458121538,
//                 "z": 0
//             },
//             "radius": 8.395129570304851,
//             "startAngle": 0,
//             "endAngle": 1.2382411425881532,
//             "angleLength": 1.2382411425881532
//         },
//         {
//             "type": "ARC",
//             "handle": "1000006F",
//             "ownerHandle": "1F",
//             "layer": "MODELSKETCH_VISIBLE",
//             "center": {
//                 "x": 15.6454611569643,
//                 "y": 10.17081458121538,
//                 "z": 0
//             },
//             "radius": 7.564290426671505,
//             "startAngle": 3.141592653589793,
//             "endAngle": 4.71238898038469,
//             "angleLength": 1.5707963267948966
//         },
//         {
//             "type": "LINE",
//             "vertices": [
//                 {
//                     "x": 15.6454611569643,
//                     "y": 2.606524154543877,
//                     "z": 0
//                 },
//                 {
//                     "x": 15.6454611569643,
//                     "y": 0,
//                     "z": 0
//                 }
//             ],
//             "handle": "10000073",
//             "ownerHandle": "1F",
//             "layer": "MODELSKETCH_VISIBLE"
//         },
//         {
//             "type": "LINE",
//             "vertices": [
//                 {
//                     "x": 15.6454611569643,
//                     "y": 0,
//                     "z": 0
//                 },
//                 {
//                     "x": 0,
//                     "y": 0,
//                     "z": 0
//                 }
//             ],
//             "handle": "10000077",
//             "ownerHandle": "1F",
//             "layer": "MODELSKETCH_VISIBLE"
//         },
//         {
//             "type": "ARC",
//             "handle": "1000007B",
//             "ownerHandle": "1F",
//             "layer": "MODELSKETCH_VISIBLE",
//             "center": {
//                 "x": 2.740667958278209,
//                 "y": 10.17081458121538,
//                 "z": 0
//             },
//             "radius": 8.395129570304851,
//             "startAngle": 1.9033515110016392,
//             "endAngle": 3.141592653589793,
//             "angleLength": 1.2382411425881539
//         }
//     ]
// }
// now i want to 'sweep' a triangle shape along each entity individually

const triangleShape = [
    new THREE.Vector2(0, 1),
    new THREE.Vector2(-0.5, -0.5),
    new THREE.Vector2(0.5, -0.5)
  ];
    // foreach entity, create a mesh
    function sweepTriangleAlongPath(path) {
        const segments = 10;
        const frames = path.computeFrenetFrames(segments, false);
        const positions = [];
      
        for (let i = 0; i <= segments; i++) {
          const pt = path.getPointAt(i / segments);
          const normal = frames.normals[i];
          const binormal = frames.binormals[i];
      
          for (const p of triangleShape) {
            const pos = new THREE.Vector3()
              .copy(pt)
              .add(normal.clone().multiplyScalar(p.x))
              .add(binormal.clone().multiplyScalar(p.y));
            positions.push(pos);
          }
        }
      
        const geometry = new THREE.BufferGeometry();
        const verts = [];
        const indices = [];
      
        // convert positions to flat array
        for (const v of positions) verts.push(v.x, v.y, v.z);
      
        // create faces (triangle strip style)
        for (let i = 0; i < segments; i++) {
          const base = i * 3;
          for (let j = 0; j < 3; j++) {
            const a = base + j;
            const b = base + (j + 1) % 3;
            const c = a + 3;
            const d = b + 3;
      
            indices.push(a, c, d);
            indices.push(a, d, b);
          }
        }
      
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
      
        return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x00ff99 }));
      }

    const meshes = [];
    for (const entity of dxf.entities) {
        let path = null;
      
        if (entity.type === 'LINE') {
          const [start, end] = entity.vertices;
          path = new THREE.LineCurve3(
            new THREE.Vector3(start.x, start.y, start.z),
            new THREE.Vector3(end.x, end.y, end.z)
          );
        }
      
        if (entity.type === 'ARC') {
          const { center, radius, startAngle, endAngle } = entity;
          const clockwise = endAngle < startAngle;
          const angleLength = clockwise
            ? startAngle - endAngle
            : endAngle - startAngle;

            // let start = entity.startAngle;
            // let end = entity.endAngle;

            // // Normalize angle to ensure positive sweep direction (CCW)
            // if (end <= start) end += Math.PI * 2;

            // const angleLength = end - start;
                
      
          const arcPoints = [];
          const steps = 20;
      
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const angle = clockwise
              ? startAngle - t * angleLength
              : startAngle + t * angleLength;
            const x = center.x + radius * Math.cos(angle);
            const y = center.y + radius * Math.sin(angle);
            arcPoints.push(new THREE.Vector3(x, y, 0));
          }
      
          path = new THREE.CatmullRomCurve3(arcPoints);
        }
      
        if (path) {
          const mesh = sweepTriangleAlongPath(path);
          meshes.push(mesh);
        }
      }

    return meshes


}catch(err) {
    return console.error(err.stack);
}
    

            }