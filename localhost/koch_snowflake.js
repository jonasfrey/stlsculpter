function() {


    function getKochSnowflakePoints(iterations = 3, size = 100, center = { x: 0, y: 0 }) {
        // Initial equilateral triangle (iteration 0)
        const height = size * (Math.sqrt(3) / 2);
        const points = [
            { x: center.x, y: center.y - (2/3) * height },           // Top
            { x: center.x - size/2, y: center.y + (1/3) * height },  // Bottom-left
            { x: center.x + size/2, y: center.y + (1/3) * height },  // Bottom-right
            { x: center.x, y: center.y - (2/3) * height }            // Close triangle
        ];
    
        // Koch subdivision function
        function subdivide(points) {
            const newPoints = [];
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
    
                // Split into 3 segments
                const dx = (p2.x - p1.x) / 3;
                const dy = (p2.y - p1.y) / 3;
    
                // Points A, B, D, E (linear divisions)
                const A = p1;
                const B = { x: p1.x + dx, y: p1.y + dy };
                const D = { x: p1.x + 2 * dx, y: p1.y + 2 * dy };
                const E = p2;
    
                // Point C (the "bump" in Koch curve)
                const angle = Math.PI / 3; // 60° rotation
                const C = {
                    x: B.x + dx * Math.cos(angle) - dy * Math.sin(angle),
                    y: B.y + dx * Math.sin(angle) + dy * Math.cos(angle)
                };
    
                newPoints.push(A, B, C, D);
            }
            newPoints.push(points[points.length - 1]); // Close the shape
            return newPoints;
        }
    
        // Apply iterations
        let kochPoints = [...points];
        for (let i = 0; i < iterations; i++) {
            kochPoints = subdivide(kochPoints);
        }
    
        return kochPoints;
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
    let n_radius_base = n_height * 0.5;
    
    function f_o_vec(x, y, z) {
        return { n_x: x, n_y: y, n_z: z };
    }
    
    function f_a_o_p(n_it_layer_nor) {
        const rotationAngle = n_tau*0.2; // Rotate by 0.2 radians each layer
        
        let a_o = getKochSnowflakePoints(
            4,
            n_radius_base + (Math.sin(n_it_layer_nor * n_tau * 0.92) * 0.5 + 0.5) * n_radius_base,
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