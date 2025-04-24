function() {
    

    let n_scl_x_cube = 5;
    let n_scl_y_cube = 5;
    let n_scl_z_cube = 5; 
    let n_its_cube_x = 9;
    let n_its_cube_y = 9;
    let a_o_mesh = []
    for(let n_it_cube_x = 0; n_it_cube_x < n_its_cube_x; n_it_cube_x+=1){
        let n_it_cube_x_nor = n_it_cube_x / n_its_cube_x;
        for(let n_it_cube_y = 0; n_it_cube_y < n_its_cube_y; n_it_cube_y+=1){
            let n_it_cube_y_nor = n_it_cube_y / n_its_cube_y;
            let nm1 = (n_it_cube_x%2);
            let nm2 = (n_it_cube_y%2);
            n_scl_z_cube =  (nm1 == nm2) ? 1 : 3;
            let o_geo = new THREE.BoxGeometry( n_scl_x_cube, n_scl_y_cube, n_scl_z_cube )
            let o_mesh = f_o_shaded_mesh(o_geo);
            
            o_mesh.position.set(
                n_it_cube_x*5,
                n_it_cube_y*5,
                n_scl_z_cube/2.
            );
            
            a_o_mesh.push(
                o_mesh
            );
        }
    }

    let f_o_extruded_ring = function(
        n_radius_inner, 
        n_radius_outer, 
        n_extrusion = 2, 
        n_polygon_points = 32
    ){
        const shape = new THREE.Shape();
        // shape.moveTo( 0,0 );
        // shape.lineTo( 0, width );
        // shape.lineTo( length, width );
        // shape.lineTo( length, 0 );
        // shape.lineTo( 0, 0 );
        let o0 = {}
        
        for(let n= 0; n<=n_polygon_points; n+=1){
            let n_it_nor = n / n_polygon_points;
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
            let n_it_nor = n / n_polygon_points;
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
            bevelEnabled: false,
            bevelThickness: 0,
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
    let n_radius_ring_inner = 2
    let n_radius_ring_outer = 5;
    
    let o_extruded_mesh = f_o_extruded_ring(n_radius_ring_inner,n_radius_ring_outer, 2, 128);
    let o_mesh = f_o_shaded_mesh(o_extruded_mesh);
    o_mesh.position.set(-n_radius_ring_outer/2-n_radius_ring_inner/2, -n_radius_ring_outer/2-n_radius_ring_inner/2,0)
    a_o_mesh.push(o_mesh);
            return a_o_mesh
}