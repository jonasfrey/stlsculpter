

async function() {
    let a_o_mesh = [];
    const x = 0, y = 0;

    const heartShape = new THREE.Shape();
    
    heartShape.moveTo( x + 5, y + 5 );
    heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );

    
    const geometry = new THREE.ShapeGeometry( heartShape );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const mesh = new THREE.Mesh( geometry, material ) ;
    a_o_mesh.push( mesh );

    return a_o_mesh;

}