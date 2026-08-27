const systems = {
    "cu-ag": {
        name: "Cu-Ag (Eutectic)",
        xLabel: "Weight Percent Silver (wt% Ag)",
        xMin: 0, xMax: 100, step: 0.1, defaultC0: 30,
        yMin: 200, yMax: 1150, defaultT: 1100,
        phases: [
            { id: "L", name: "Liquid (L)", color: "rgba(52, 152, 219, 0.3)", lineColor: "#2980b9" },
            { id: "alpha", name: "Solid (α)", color: "rgba(231, 76, 60, 0.3)", lineColor: "#c0392b" },
            { id: "beta", name: "Solid (β)", color: "rgba(46, 204, 113, 0.3)", lineColor: "#27ae60" }
        ],
        getRegions: function() {
            let L = [[0, 1150]];
            for(let x=0; x<=71.9; x+=1) L.push([x, 1084.6 - (1084.6 - 779) * Math.pow(x / 71.9, 1.5)]);
            for(let x=71.9; x<=100; x+=1) L.push([x, 961.8 - (961.8 - 779) * Math.pow((100 - x) / (100 - 71.9), 1.5)]);
            L.push([100, 1150]);

            let alpha = [[0, 200], [0, 1084.6]];
            for(let T=1084.6; T>=779; T-=5) alpha.push([7.9 * (1084.6 - T) / (1084.6 - 779), T]);
            for(let T=779; T>=200; T-=5) alpha.push([1.0 + (7.9 - 1.0) * (T - 200) / (779 - 200), T]);

            let beta = [[100, 200], [100, 961.8]];
            for(let T=961.8; T>=779; T-=5) beta.push([100 - (100 - 91.2) * (961.8 - T) / (961.8 - 779), T]);
            for(let T=779; T>=200; T-=5) beta.push([99.0 - (99.0 - 91.2) * (T - 200) / (779 - 200), T]);

            return [
                { id: "L", polygon: L },
                { id: "alpha", polygon: alpha },
                { id: "beta", polygon: beta }
            ];
        },
        invariantLines: [
            { y: 779, xMin: 7.9, xMax: 91.2, label: 'Eutectic (779°C)' }
        ]
    },
    "fe-c": {
        name: "Fe-C (Steel)",
        xLabel: "Weight Percent Carbon (wt% C)",
        xMin: 0, xMax: 6.67, step: 0.01, defaultC0: 0.4,
        yMin: 400, yMax: 1600, defaultT: 1550,
        phases: [
            { id: "L", name: "Liquid (L)", color: "rgba(52, 152, 219, 0.3)", lineColor: "#2980b9" },
            { id: "delta", name: "δ-Ferrite", color: "rgba(241, 196, 15, 0.3)", lineColor: "#f39c12" },
            { id: "gamma", name: "Austenite (γ)", color: "rgba(231, 76, 60, 0.3)", lineColor: "#c0392b" },
            { id: "alpha", name: "Ferrite (α)", color: "rgba(155, 89, 182, 0.3)", lineColor: "#8e44ad" },
            { id: "cem", name: "Cementite (Fe₃C)", color: "rgba(52, 73, 94, 0.3)", lineColor: "#2c3e50" }
        ],
        getRegions: function() {
            return [
                { id: "L", polygon: [ [0, 1600], [0, 1538], [0.53, 1495], [4.3, 1147], [6.67, 1250], [6.67, 1600] ] },
                { id: "delta", polygon: [ [0, 1538], [0.09, 1495], [0, 1394] ] },
                { id: "gamma", polygon: [ [0, 1394], [0.17, 1495], [2.14, 1147], [0.76, 727], [0.022, 727], [0, 912] ] },
                { id: "alpha", polygon: [ [0, 912], [0.022, 727], [0.005, 400], [0, 400] ] },
                { id: "cem", polygon: [ [6.67, 400], [6.67, 1600], [6.671, 1600], [6.671, 400] ] }
            ];
        },
        invariantLines: [
            { y: 1495, xMin: 0.09, xMax: 0.53, label: 'Peritectic (1495°C)' },
            { y: 1147, xMin: 2.14, xMax: 6.67, label: 'Eutectic (1147°C)' },
            { y: 727, xMin: 0.022, xMax: 6.67, label: 'Eutectoid (727°C)' }
        ]
    },
    "peritectic": {
        name: "Generic Peritectic",
        xLabel: "Weight Percent B (wt% B)",
        xMin: 0, xMax: 100, step: 0.1, defaultC0: 65,
        yMin: 200, yMax: 1200, defaultT: 1100,
        phases: [
            { id: "L", name: "Liquid (L)", color: "rgba(52, 152, 219, 0.3)", lineColor: "#2980b9" },
            { id: "alpha", name: "Solid (α)", color: "rgba(231, 76, 60, 0.3)", lineColor: "#c0392b" },
            { id: "beta", name: "Solid (β)", color: "rgba(46, 204, 113, 0.3)", lineColor: "#27ae60" }
        ],
        getRegions: function() {
            return [
                { id: "L", polygon: [ [0, 1200], [0, 1000], [80, 800], [100, 600], [100, 1200] ] },
                { id: "alpha", polygon: [ [0, 200], [0, 1000], [20, 800], [5, 200] ] },
                { id: "beta", polygon: [ [50, 800], [100, 600], [100, 200], [70, 200] ] }
            ];
        },
        invariantLines: [
            { y: 800, xMin: 20, xMax: 80, label: 'Peritectic (800°C)' }
        ]
    }
};

let currentSystemId = "fe-c";

function isPointInPolygon(point, vs) {
    let x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0], yi = vs[i][1];
        let xj = vs[j][0], yj = vs[j][1];
        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function getIntersections(regions, T) {
    let intersections = [];
    for (let r of regions) {
        let poly = r.polygon;
        for (let i = 0; i < poly.length; i++) {
            let p1 = poly[i];
            let p2 = poly[(i + 1) % poly.length];
            
            let yMin = Math.min(p1[1], p2[1]);
            let yMax = Math.max(p1[1], p2[1]);
            
            // Skip perfectly horizontal lines
            if (p1[1] === p2[1]) continue;
            
            if (T >= yMin && T <= yMax) {
                let x = p1[0] + (T - p1[1]) * (p2[0] - p1[0]) / (p2[1] - p1[1]);
                intersections.push({ x: x, phaseId: r.id });
            }
        }
    }
    
    // Sort and remove duplicates (from shared edges)
    intersections.sort((a, b) => a.x - b.x);
    let unique = [];
    for (let inter of intersections) {
        let exists = unique.find(u => Math.abs(u.x - inter.x) < 1e-4 && u.phaseId === inter.phaseId);
        if (!exists) unique.push(inter);
    }
    return unique;
}

function initSystem() {
    let sys = systems[currentSystemId];
    
    let compSlider = document.getElementById('composition');
    compSlider.min = sys.xMin; compSlider.max = sys.xMax; compSlider.step = sys.step;
    compSlider.value = sys.defaultC0;
    
    let tempSlider = document.getElementById('temperature');
    tempSlider.min = sys.yMin; tempSlider.max = sys.yMax; tempSlider.step = (sys.yMax - sys.yMin) / 100;
    tempSlider.value = sys.defaultT;
    
    updateSimulation();
}

function updateSimulation() {
    let sys = systems[currentSystemId];
    const C0 = parseFloat(document.getElementById('composition').value);
    const T = parseFloat(document.getElementById('temperature').value);
    
    document.getElementById('comp-value').innerText = C0.toFixed(2);
    document.getElementById('temp-value').innerText = T.toFixed(0);

    let regions = sys.getRegions();
    
    // Determine Phase State
    let state = { type: 'unknown', phases: [] };
    
    // 1. Check if inside any single phase
    for (let r of regions) {
        if (isPointInPolygon([C0, T], r.polygon)) {
            state = { type: 'single', phaseId: r.id, fraction: 100 };
            break;
        }
    }
    
    // 2. Check intersections for 2-phase regions
    if (state.type === 'unknown') {
        let inters = getIntersections(regions, T);
        let leftNode = null;
        let rightNode = null;
        
        for (let i of inters) {
            if (i.x <= C0) {
                if (!leftNode || i.x > leftNode.x) leftNode = i;
            }
            if (i.x >= C0) {
                if (!rightNode || i.x < rightNode.x) rightNode = i;
            }
        }
        
        if (leftNode && rightNode && leftNode.x !== rightNode.x && leftNode.phaseId !== rightNode.phaseId) {
            let WL = (rightNode.x - C0) / (rightNode.x - leftNode.x) * 100;
            let WR = (C0 - leftNode.x) / (rightNode.x - leftNode.x) * 100;
            state = {
                type: 'two',
                p1: { id: leftNode.phaseId, x: leftNode.x, frac: WL },
                p2: { id: rightNode.phaseId, x: rightNode.x, frac: WR }
            };
        }
    }

    // Build Plot Traces
    let data = [];
    
    // Add single phase polygons
    for (let r of regions) {
        let pObj = sys.phases.find(p => p.id === r.id);
        let x = r.polygon.map(p => p[0]);
        let y = r.polygon.map(p => p[1]);
        // Close polygon
        x.push(x[0]); y.push(y[0]);
        
        data.push({
            x: x, y: y,
            mode: 'lines',
            fill: 'toself',
            fillcolor: pObj.color,
            line: { color: pObj.lineColor, width: 2 },
            name: pObj.name,
            hoverinfo: 'name'
        });
    }

    // Add invariant lines visually
    for(let inv of sys.invariantLines) {
        data.push({
            x: [inv.xMin, inv.xMax], y: [inv.y, inv.y],
            mode: 'lines+text',
            text: ['', ' ' + inv.label], textposition: 'middle right', textfont: { color: '#94a3b8' },
            line: { color: '#94a3b8', width: 2, dash: 'dash' },
            showlegend: false, hoverinfo: 'none'
        });
    }

    // Dynamic Tie Line and Markers
    let phaseNames = [];
    let barsHtml = "";
    
    if (state.type === 'single') {
        let p = sys.phases.find(x => x.id === state.phaseId);
        phaseNames.push(p.name);
        
        barsHtml += `
            <div class="bar-row">
                <span>${p.name}:</span>
                <div class="bar-wrapper"><div class="bar" style="background:${p.lineColor}; width:100%;"></div></div>
                <span>100.0%</span>
            </div>
            <div style="margin-top:10px;"><strong>${p.name} Composition:</strong> ${C0.toFixed(2)} ${sys.xLabel.split('(')[1].replace(')','')}</div>
        `;
        
        // Single state marker
        data.push({
            x: [C0], y: [T], mode: 'markers', marker: {color: '#FF5722', size: 10, symbol: 'square-open', line: {color: '#FF5722', width: 2}}, showlegend: false, hoverinfo: 'none'
        });
        
    } else if (state.type === 'two') {
        let p1 = sys.phases.find(x => x.id === state.p1.id);
        let p2 = sys.phases.find(x => x.id === state.p2.id);
        phaseNames.push(p1.name, p2.name);
        
        barsHtml += `
            <div class="bar-row">
                <span>${p1.name}:</span>
                <div class="bar-wrapper"><div class="bar" style="background:${p1.lineColor}; width:${state.p1.frac}%;"></div></div>
                <span>${state.p1.frac.toFixed(1)}%</span>
            </div>
            <div class="bar-row">
                <span>${p2.name}:</span>
                <div class="bar-wrapper"><div class="bar" style="background:${p2.lineColor}; width:${state.p2.frac}%;"></div></div>
                <span>${state.p2.frac.toFixed(1)}%</span>
            </div>
            <div style="margin-top:10px;">
                <div><strong>${p1.name} Composition:</strong> ${state.p1.x.toFixed(2)} ${sys.xLabel.split('(')[1].replace(')','')}</div>
                <div><strong>${p2.name} Composition:</strong> ${state.p2.x.toFixed(2)} ${sys.xLabel.split('(')[1].replace(')','')}</div>
            </div>
        `;

        // Tie line
        data.push({
            x: [state.p1.x, state.p2.x], y: [T, T],
            mode: 'lines+markers', line: {color: '#00E5FF', width: 2, dash: 'dot'}, marker: {color: '#00E5FF', size: 6, symbol: 'square'}, showlegend: false, hoverinfo: 'none'
        });
        
        // Alloy State Marker
        data.push({
            x: [C0], y: [T], mode: 'markers', marker: {color: '#FF5722', size: 12, symbol: 'square-open', line: {color: '#FF5722', width: 2}}, showlegend: false, hoverinfo: 'none'
        });
    } else {
        phaseNames.push("Unknown (check boundaries)");
    }

    // Isopleth
    data.push({
        x: [C0, C0], y: [sys.yMin, sys.yMax], mode: 'lines', line: {color: 'rgba(255,255,255,0.3)', dash: 'dot'}, showlegend: false, hoverinfo: 'none'
    });
    
    // Path Tracing (Cooling History)
    let trace_L_x = [], trace_L_y = [];
    let trace_S1_x = [], trace_S1_y = [], trace_S1_id = null;
    let trace_S2_x = [], trace_S2_y = [], trace_S2_id = null;
    
    for (let t_step = sys.yMax; t_step >= T; t_step -= (sys.yMax - sys.yMin)/100) {
        let tempState = {type: 'unknown'};
        for (let r of regions) {
            if (isPointInPolygon([C0, t_step], r.polygon)) {
                tempState = { type: 'single', phaseId: r.id }; break;
            }
        }
        if (tempState.type === 'unknown') {
            let inters = getIntersections(regions, t_step);
            let leftNode = null, rightNode = null;
            for (let i of inters) {
                if (i.x <= C0 && (!leftNode || i.x > leftNode.x)) leftNode = i;
                if (i.x >= C0 && (!rightNode || i.x < rightNode.x)) rightNode = i;
            }
            if (leftNode && rightNode) {
                tempState = { type: 'two', p1: leftNode, p2: rightNode };
            }
        }
        
        if (tempState.type === 'single') {
            if (tempState.phaseId === 'L') { trace_L_x.push(C0); trace_L_y.push(t_step); }
            else if (!trace_S1_id || trace_S1_id === tempState.phaseId) {
                trace_S1_id = tempState.phaseId; trace_S1_x.push(C0); trace_S1_y.push(t_step);
            }
        } else if (tempState.type === 'two') {
            if (tempState.p1.phaseId === 'L' || tempState.p2.phaseId === 'L') {
                let L_node = tempState.p1.phaseId === 'L' ? tempState.p1 : tempState.p2;
                let S_node = tempState.p1.phaseId === 'L' ? tempState.p2 : tempState.p1;
                trace_L_x.push(L_node.x); trace_L_y.push(t_step);
                
                if (!trace_S1_id || trace_S1_id === S_node.phaseId) {
                    trace_S1_id = S_node.phaseId; trace_S1_x.push(S_node.x); trace_S1_y.push(t_step);
                } else if (!trace_S2_id || trace_S2_id === S_node.phaseId) {
                    trace_S2_id = S_node.phaseId; trace_S2_x.push(S_node.x); trace_S2_y.push(t_step);
                }
            } else {
                let S1 = tempState.p1, S2 = tempState.p2;
                if (!trace_S1_id) trace_S1_id = S1.phaseId;
                if (!trace_S2_id && S2.phaseId !== trace_S1_id) trace_S2_id = S2.phaseId;
                
                if (S1.phaseId === trace_S1_id) { trace_S1_x.push(S1.x); trace_S1_y.push(t_step); }
                else if (S1.phaseId === trace_S2_id) { trace_S2_x.push(S1.x); trace_S2_y.push(t_step); }
                
                if (S2.phaseId === trace_S1_id) { trace_S1_x.push(S2.x); trace_S1_y.push(t_step); }
                else if (S2.phaseId === trace_S2_id) { trace_S2_x.push(S2.x); trace_S2_y.push(t_step); }
            }
        }
    }
    
    // Add Traces
    if(trace_L_x.length > 0) {
        let pObj = sys.phases.find(p => p.id === 'L');
        data.push({ x: trace_L_x, y: trace_L_y, mode: 'lines', line: {color: pObj.lineColor, width: 4}, showlegend: false, hoverinfo: 'none' });
    }
    if(trace_S1_x.length > 0) {
        let pObj = sys.phases.find(p => p.id === trace_S1_id);
        if(pObj) data.push({ x: trace_S1_x, y: trace_S1_y, mode: 'lines', line: {color: pObj.lineColor, width: 4}, showlegend: false, hoverinfo: 'none' });
    }
    if(trace_S2_x.length > 0) {
        let pObj = sys.phases.find(p => p.id === trace_S2_id);
        if(pObj) data.push({ x: trace_S2_x, y: trace_S2_y, mode: 'lines', line: {color: pObj.lineColor, width: 4}, showlegend: false, hoverinfo: 'none' });
    }

    // UI Updates
    document.getElementById('phase-status').innerText = `Status: ${phaseNames.join(" + ")}`;
    document.getElementById('bars-container').innerHTML = barsHtml;

    const layout = {
        title: { text: sys.name + ' Phase Diagram', font: { color: '#00E5FF', family: "'Chakra Petch', sans-serif" } },
        xaxis: { 
            title: sys.xLabel, range: [sys.xMin, sys.xMax], 
            gridcolor: 'rgba(0,229,255,0.1)', tickfont: { color: '#7dd3fc', family: "'JetBrains Mono', monospace" }, titlefont: { color: '#00E5FF', family: "'JetBrains Mono', monospace" } 
        },
        yaxis: { 
            title: 'Temp (°C)', range: [sys.yMin, sys.yMax],
            gridcolor: 'rgba(0,229,255,0.1)', tickfont: { color: '#7dd3fc', family: "'JetBrains Mono', monospace" }, titlefont: { color: '#00E5FF', family: "'JetBrains Mono', monospace" }
        },
        showlegend: true,
        legend: { x: 1.05, y: 1, font: { color: '#e0f2fe', family: "'JetBrains Mono', monospace" }, bgcolor: 'rgba(0,0,0,0)' },
        hovermode: 'closest',
        margin: { l: 60, r: 120, t: 60, b: 60 },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.react('phase-diagram', data, layout);
}

// Event Listeners
document.getElementById('system-select').addEventListener('change', (e) => {
    currentSystemId = e.target.value;
    initSystem();
});
document.getElementById('composition').addEventListener('input', updateSimulation);
document.getElementById('temperature').addEventListener('input', updateSimulation);

// Init
initSystem();
