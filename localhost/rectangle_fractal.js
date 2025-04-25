function() {

    let f_n_len = function(o){
        return Math.sqrt(
            Math.pow(o.x,2.)
            +Math.pow(o.y,2.)
        )
    }
    function f_a_o_p_square_fractal(iterations = 3, size = 100, factor = 1.0,center = { x: 0, y: 0 }) {
        // Initial square (iteration 0)
        const points = [];
        let n_tau = Math.PI*2;
        for(let n = 0; n < 4; n += 1) {
            let n_it_nor = n/4;
            points.push({
                x: center.x + Math.cos(n_it_nor * n_tau) * size,
                y: center.y + Math.sin(n_it_nor * n_tau) * size
            });
        }

        function f_a_o_p_subdivide(o_p1, o_p2) {
            let o_p_delta = { // direction vector
                x: o_p2.x - o_p1.x,
                y: o_p2.y - o_p1.y
            }
            let n_lendelta = Math.sqrt(o_p_delta.x * o_p_delta.x + o_p_delta.y * o_p_delta.y);
            let o_p_delta_nor = { // normalized direction vector
                x: o_p_delta.x / n_lendelta,
                y: o_p_delta.y / n_lendelta,
            }
            // orthogonal direction vector
            let o_p_delta_nor_ortho = {
                x: o_p_delta_nor.y, 
                y: -o_p_delta_nor.x
            }

            let o_ps1 = o_p1;
            let o_ps6 = o_p2;
            let o_ps2 = {
                x: o_p1.x + (1/3) * o_p_delta.x,
                y: o_p1.y + (1/3) * o_p_delta.y,
            };
            let n_len = n_lendelta / 3; // Using segment length for the "bump"

            let o_ps5 = {
                x: o_p1.x + (2/3) * o_p_delta.x,
                y: o_p1.y + (2/3) * o_p_delta.y,
            };
            let o_ps3 = {
                x: o_ps2.x + o_p_delta_nor_ortho.x * n_len*factor,
                y: o_ps2.y + o_p_delta_nor_ortho.y * n_len*factor,
            };
            let o_ps4 = {
                x: o_ps5.x + o_p_delta_nor_ortho.x * n_len*factor,
                y: o_ps5.y + o_p_delta_nor_ortho.y * n_len*factor,
            };
            
            return [o_ps1, o_ps2, o_ps3, o_ps4, o_ps5, o_ps6];
        }
    
        // Apply iterations
        let a_o_p = [...points];
        for (let i = 0; i < iterations; i++) {
            let a_o_p_new = [];
            for(let n_idx = 0; n_idx < a_o_p.length; n_idx++) {
                a_o_p_new.push(
                    ...f_a_o_p_subdivide(
                        a_o_p[n_idx],
                        a_o_p[(n_idx+1) % a_o_p.length]
                    )
                );
            }
            a_o_p = a_o_p_new;
        }
        return a_o_p;
    }

    
    function rotatePoint(point, center, angle) {
        // Translate point to origin
        const translatedX = point.x - center.x;
        const translatedY = point.y - center.y;
        
        // Apply rotation
        const rotatedX = translatedX * Math.cos(angle) - translatedY * Math.sin(angle);
        const rotatedY = translatedX * Math.sin(angle) + translatedY * Math.cos(angle);
        
        // Translate back
        return {
            x: rotatedX + center.x,
            y: rotatedY + center.y
        };
    }
    
    const n_tau = Math.PI * 2;
    // all units in millimeter mm
    let n_height = 100.;
    let n_layer_height = 1;
    let n_its_layer = parseInt(n_height / n_layer_height);
    let a_o_geometry = []
    let n_corners = 40.;
    let a_o_p_outside = [];
    let n_radius_base = n_height * 0.3;
    
    function f_o_vec(x, y, z) {
        return { n_x: x, n_y: y, n_z: z };
    }
    
    function f_a_o_p(n_it_layer_nor) {
        const rotationAngle = n_tau*0.2; // Rotate by 0.2 radians each layer
        let n_factor = (Math.sin(n_it_layer_nor*n_tau*2.)*.5+.5)
        let a_o = f_a_o_p_square_fractal(
            3,
            n_radius_base ,//+ (Math.sin(n_it_layer_nor * n_tau * 0.92) * 0.5 + 0.5) * n_radius_base,
            n_factor,
            { x: 0, y: 0 }
        ).map(o => {
            // Create 3D point with z-coordinate
            let o_3d = {
                n_x: o.x,
                n_y: o.y,
                n_z: n_it_layer_nor * n_height
            };
            
            // Rotate the 2D projection (x,y) around center (0,0)
            const rotated = rotatePoint(
                { x: o_3d.n_x, y: o_3d.n_y },
                { x: 0, y: 0 },
                rotationAngle * n_it_layer_nor
            );
            
            return {
                n_x: rotated.x,
                n_y: rotated.y,
                n_z: o_3d.n_z
            };
        });
        
        n_corners = a_o.length;
        return a_o;
    }
    
    for (let n_it_layer = 1.; n_it_layer <= n_its_layer; n_it_layer += 1) {
        let n_it_layer_nor = n_it_layer / n_its_layer;
        let a_o_p = f_a_o_p(n_it_layer_nor);
        a_o_p_outside.push(...a_o_p);
        if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
            // only bottom and top face
            a_o_geometry.push(
                f_o_geometry_from_a_o_p(a_o_p)
            )
        }

    }
    
    // Assuming these functions are defined elsewhere:
    // function f_o_geometry_from_a_o_p_polygon_vertex(points, corners) { ... }
    // function f_o_shaded_mesh(geometry) { ... }
    
    a_o_geometry.push(
        // the outside/'skirt' of the extruded polygon
        f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
    );
    
    let a_o_mesh = a_o_geometry.map(o => f_o_shaded_mesh(o));
    return a_o_mesh;
    
            }