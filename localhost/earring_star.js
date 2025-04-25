function() {
    
    // Create pentagonal star shape
    function f_o_shape_star(
        n_corners = 5, 
        n_radius_outer = 10, 
        n_radius_inner = 5, 
    ) {
        const shape = new THREE.Shape();
        let n_tau = Math.PI*2;
        // Start at the first outer point
        let n_its = n_corners*2;
    
        for (let n_it = 0; n_it < n_its; n_it+=1) {
            let n_it_nor = n_it / n_its;
            // Outer point
            let n_ang = n_it_nor * n_tau;
            let n_radius = (n_it % 2 == 0 ) ? n_radius_inner : n_radius_outer;
            let o = {
                x: Math.sin(n_ang)*n_radius,
                y: Math.cos(n_ang)*n_radius,
            }
            if(n_it == 0){  
                shape.moveTo(o.x, o.y);
            }else{
    
                shape.lineTo(
                    o.x, 
                    o.y
                );
            }
            
        }
    
        return shape;
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
    
    let f_a_o_mesh_boxline = function(p1, p2, thickness = 0.1, n_z = 0.1) {
        // Calculate midpoint
        p1 = new THREE.Vector3( p1.x, p1.y, 0 );
        p2 = new THREE.Vector3( p2.x, p2.y, 0 );
        const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        
        // Calculate length
        const length = p1.distanceTo(p2);
        
        // Calculate angle
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        
        // Create box geometry
        const geometry = new THREE.BoxGeometry(length, thickness, n_z);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const line = f_o_shaded_mesh(geometry)
        
        // Position and rotate
        line.position.copy(midpoint);
        line.rotation.z = angle;
        
        const o_geo_cyl1 = new THREE.CylinderGeometry( thickness/2, thickness/2, n_z, 32 ); 
        let o_mesh_cyl1 = f_o_shaded_mesh(o_geo_cyl1);
        o_mesh_cyl1.rotation.set(n_tau/4, 0, 0)
        o_mesh_cyl1.position.set(p1.x, p1.y, p1.z);
            n_z
        const o_geo_cyl2 = new THREE.CylinderGeometry( thickness/2, thickness/2, n_z, 32 ); 
        let o_mesh_cyl2 = f_o_shaded_mesh(o_geo_cyl2);
        o_mesh_cyl2.rotation.set(n_tau/4, 0, 0)
        o_mesh_cyl2.position.set(p1.x, p1.y, p1.z);
    
        return [line, o_mesh_cyl1, o_mesh_cyl2];
    }
    
    let f_a_o_mesh_linestar = function(
        n_corners = 5, 
        n_radius_outer = 10, 
        n_radius_inner = 5, 
        n_width = 1, 
        n_z = 1
    ){
        let a_o_mesh = [];
        let n_tau = Math.PI*2;
        // Start at the first outer point
        let n_its = n_corners*2;
    
        for (let n_it = 0; n_it < n_its; n_it+=1) {
            let n_it2 = ((n_it+1)%n_its);
            let n_it_nor = n_it / n_its;
            let n_it_nor2 = n_it2 / n_its;
            // Outer point
            let n_ang = n_it_nor * n_tau;
            let n_ang2 = n_it_nor2 * n_tau;
    
            let n_radius = (n_it % 2 == 0 ) ? n_radius_inner : n_radius_outer;
            let n_radius2 = (n_it2 % 2 == 0 ) ? n_radius_inner : n_radius_outer;
            let o = {
                x: Math.sin(n_ang)*n_radius,
                y: Math.cos(n_ang)*n_radius,
            }
            let o2 = {
                x: Math.sin(n_ang2)*n_radius2,
                y: Math.cos(n_ang2)*n_radius2,
            }
            let od = {
                x: o.x - o2.x, 
                y: o.y - o2.y
            };
            let n_len = Math.sqrt(
                Math.pow(od.x, 2)
                + Math.pow(od.y, 2)
            )
            // const o_geo = new THREE.BoxGeometry( n_len, n_width, n_z ); 
            let a_o_mesh_boxline = f_a_o_mesh_boxline(o, o2, n_width, n_z);
            a_o_mesh.push(
                ...a_o_mesh_boxline
            )
        }
    
        return a_o_mesh;
    }
    // Extrude settings
    let n_extrude_base = 0.6;
    const extrudeSettings = {
        steps: 1,
        depth:n_extrude_base,
        bevelEnabled: false,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 3
    };
    
    // Create the star geometry
    let n_corners = 6;
    let n_radius_outer = 20;
    let n_radius_inner = 10;
    const starShape = f_o_shape_star(n_corners, n_radius_outer, n_radius_inner);
    const o_geo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    
    let n_width = 0.6;
    let n_z = 1;
    
    let a_o_mesh = []
    let n_its = 5;
    for(let n_it = 0; n_it <= n_its; n_it +=1){
        let n_it_nor = n_it / n_its; 
        a_o_mesh.push(
            ...f_a_o_mesh_linestar(
                n_corners, 
                n_radius_outer*n_it_nor, 
                n_radius_inner*n_it_nor, 
                n_width, 
                n_z, 
            )
        )
    }
    
    const o_mesh = f_o_shaded_mesh(o_geo);
    
    let n_radius_ring_inner = 2; 
    let n_radius_ring_outer = 3;
    let o_extruded_mesh = f_o_extruded_ring(n_radius_ring_inner,n_radius_ring_outer, n_extrude_base, 128);
    let o_mesh_ring = f_o_shaded_mesh(o_extruded_mesh);
    o_mesh_ring.position.set(
        Math.sin(n_tau/n_corners)*(n_radius_inner+n_radius_ring_inner/2), 
        Math.cos(n_tau/n_corners)*(n_radius_inner+n_radius_ring_inner/2)
    )
    
    
    return [o_mesh, ...a_o_mesh, o_mesh_ring]
    
    }