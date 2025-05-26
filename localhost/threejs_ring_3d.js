

async function(){

    let f_o_extruded_ring = function(
        n_radius_inner, 
        n_radius_outer, 
        n_extrusion = 2, 
        n_polygon_points = 32,
        n_nor_start = 0.,
        n_nor_end = 1.
    ){
        const shape = new THREE.Shape();
        // shape.moveTo( 0,0 );
        // shape.lineTo( 0, width );
        // shape.lineTo( length, width );
        // shape.lineTo( length, 0 );
        // shape.lineTo( 0, 0 );
        let o0 = {}
        let n_nor_range = n_nor_end-n_nor_start;
        
        for(let n= 0; n<=n_polygon_points; n+=1){
            let n_it_nor = ((n / n_polygon_points)*(n_nor_range/1) + n_nor_start);
            let o = {
                x: Math.sin(n_it_nor*n_tau)*n_radius_outer, 
                y: Math.cos(n_it_nor*n_tau)*n_radius_outer
            };
            if(n == 0){
                shape.moveTo( o.x, o.y );
                o0  = o;
            }else{
                shape.lineTo( o.x, o.y );
            }
        } 
        for(let n= n_polygon_points; n>=0; n-=1){
            let n_it_nor = ((n / n_polygon_points)*(n_nor_range/1) + n_nor_start);
            let o = {
                x: Math.sin(n_it_nor*n_tau)*n_radius_inner, 
                y: Math.cos(n_it_nor*n_tau)*n_radius_inner
            };
    
            shape.lineTo( o.x, o.y );
        } 
        shape.lineTo( o0.x, o0.y );
        const extrudeSettings = {
            steps: 2,
            depth: n_extrusion,
            bevelThickness: 0.5,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 0
        };
    
        
        const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        return geometry
        // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        // const mesh = new THREE.Mesh( geometry, material ) ;
        // scene.add( mesh );
    
    }

    let a_o_mesh = [];
    let o_mod = await import("./threejs_custom_extrusions.js");
    
    let o_extruded_mesh = f_o_extruded_ring(
        4,
        6, 
        2,
        128
    );
    let o_shaded_mesh = f_o_shaded_mesh(o_extruded_mesh);

    a_o_mesh.push(o_shaded_mesh);
    return a_o_mesh;
}