async function() {
    let a_o_mesh = [];

    const o_spline = new THREE.CatmullRomCurve3( [
        new THREE.Vector3( 10, 0, 0 ),
        new THREE.Vector3( 0, 0 ,0),
        new THREE.Vector3( 0, 10,0)
    ]);
    o_spline.curveType = 'catmullrom';
    const o_cubic_bz = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 0, 0 ,0),
        new THREE.Vector3( 10, 0, 0 ),
        new THREE.Vector3( 0, 10,0)
    );

    const o_qubz = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3( 10, 0, 0 ),
            new THREE.Vector3( 0, 0 ,0),
            new THREE.Vector3( 0, 10,0)
    );
    let o_curve = o_qubz


    // o_spline.closed = true;
    const extrudeSettings1 = {
        steps: 200,
        // bevelEnabled: false,
        extrudePath: o_curve
    };


    let n_its_corner = 4; 
    let n_tau = Math.PI*2.;
    let a_o_p = []
    let n_radius = 1;
    for(let n_it_corner = 0; n_it_corner < n_its_corner; n_it_corner+=1){
        let n_it_corner_nor = n_it_corner / n_its_corner;
        n_it_corner_nor+=1./n_its_corner/2
        a_o_p.push(
            new THREE.Vector3(
                Math.sin(n_it_corner_nor*n_tau)*n_radius,
                Math.cos(n_it_corner_nor*n_tau)*n_radius,
                0
            )
        )
    }

    const shape1 = new THREE.Shape( a_o_p );

    const geometry1 = new THREE.ExtrudeGeometry( shape1, extrudeSettings1 );
    a_o_mesh.push(
        f_o_shaded_mesh(geometry1)
    )

const curve = new THREE.QuadraticBezierCurve(
        new THREE.Vector3( 10, 0, 0 ),
        new THREE.Vector3( 0, 0 ,0),
        new THREE.Vector3( 0, 10,0)
);

const points = curve.getPoints( 50 );
const geometry = new THREE.BufferGeometry().setFromPoints( points );

const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

// Create the final object to add to the scene
const curveObject = new THREE.Line( geometry, material );
    a_o_mesh.push(curveObject)
    return a_o_mesh;

}
