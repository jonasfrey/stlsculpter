function() {
    
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 210.;
            let n_layer_height = 30;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 6.;
            let a_o_p_outside = [];
            let n_radius_base = n_height*.15;
            // const phi = (1 + Math.sqrt(5)) / 2;
    
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            function f_a_o_p(
                n_it_layer_nor
                ) {
                
                let n_it_layer = n_it_layer_nor*n_its_layer;
                let nm1 = n_it_layer%2;
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it / n_corners;
                    let n_amp = n_radius_base;
                    let nx = n_it_layer_nor;
                    let nexpo = -4*(Math.pow(nx-0.5,2))+1.;
                    n_amp += nexpo*10.;
                    let nm2 = n_it%2;
                    let n_rad_offset = 0;

                    let nof1 = n_tau / n_corners / 10.;
                    let nof2 = n_tau / n_corners / 2.;
                    nof1 = n_tau / n_corners / parseInt(Math.random()*20)
                    nof2 = n_tau / n_corners / parseInt(Math.random()*20)
                    nof1 = n_tau / n_corners/2.;
                    nof2 = n_tau / n_corners/100.;
                    let nof  = (nm2 == nm1) ? nof1 : nof2; 
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset+nof) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset+nof) * n_amp,
                        n_it_layer_nor*n_height
                    );
                    let o_trn2 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset-nof) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset-nof) * n_amp,
                        n_it_layer_nor*n_height
                    );
        
                    return [o_trn2, o_trn1]
        
        
                }).flat();
                return a_o
            }
        
        
        
        
            for (let n_it_layer = 0; n_it_layer <= n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
        
                let a_o_p = f_a_o_p(
                    n_it_layer_nor
                );
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, a_o_p[0].n_z), ...a_o_p])
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners*2)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }