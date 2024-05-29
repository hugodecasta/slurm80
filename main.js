import { create_elm, decorate_with_setters, div, h1, h2, h3, hr, span } from './vanille/components.js'

const raw = (await (await fetch('/get_sinfo.php')).json())
const sinfo = raw.sinfo ?? raw.nodes ?? []

const states = {
    "IDLE": ["#2ecc71", "…"],
    "PLANNED": ["#1abc9c", "⊠"],
    "MIXED": ["#f1c40f", "⧋"],
    "ALLOCATED": ["#3498db", "⊗"],
    "COMPLETING": ["#9b59b6", "𔗫"],
    "DOWN": ["#e74c3c", "🕱"],
}

const alias = {
    gpu_p13: 'V100 (16Go / 32Go)',
    gpu_p2: 'V100 (32Go)',
    gpu_p2s: 'V100 (360Go)',
    gpu_p2l: 'V100 (720Go)',
    gpu_p5: 'A100 (80Go)',
}

function create_node_comp(node_data) {
    const { cores, gres, nodes, memory, node } = node_data
    const d = div('node').set_style({
        background: '#fff', padding: '5px', margin: '1px',
        border: '1px solid #aaa',
        display: 'inline-block', width: 'fit-content',
        position: 'relative'
    })

    if (node.state.includes('RESERVED')) {
        d.set_style({
            border: '5px solid #c0392b',
        })
    }

    const state_name = Object.keys(states).filter(s => node.state.includes(s))[0]
    const color = states[state_name][0]
    const icon = states[state_name][1]

    d.set_style({
        background: color
    })

    const ret = span()

    d.add(
        div('viewer').add(
            hr(),
            h3(node.state),
            h3('CORES: ' + cores.maximum),
            gres.total ?
                h3('GRES: ', create_elm('ul').add(...gres.total.split(',').map(n => create_elm('li').add(n))))
                : '',
            h3('MEM: ' + memory.maximum),
        ).set_style({
            position: 'absolute',
            zIndex: 10,
            background: color,
            width: '300px',
            padding: '10px',
        })
    )

    for (let i = 0; i < nodes.nodes.length; ++i) {
        const name = nodes.nodes[i]
        const c = d.clone()
        decorate_with_setters(c.childNodes[0])
        c.childNodes[0].prepend(h1(icon + ' ' + name))
        ret.add(c)
    }

    // d.add(nodes.nodes.length
    //     // h2(icon + ' ' + node.state.join(' ')),
    //     // hr(),
    //     // h3('CORES: ' + cores.maximum),
    //     // h3('GRES: ', create_elm('ul').add(...gres.total.split(',').map(n => create_elm('li').add(n)))),
    //     // h3('MEM: ' + memory.maximum),
    //     // h3('NODES: ' + nodes.nodes.length),
    // )

    return ret
}

function create_partition_comp(name, nodes) {

    const d = div()

    const node_count = nodes.map(n => n.nodes.nodes.length).reduce((a, b) => a + b, 0)

    if (name in alias) {
        name = `${name} - <span style="font-size:20px;opacity:0.7">${alias[name]}</span>`
    }
    name += ' - <span style="font-size:20px;opacity:0.5">(' + node_count + ' nodes)</span>'

    nodes.sort((a, b) => Object.keys(states).indexOf(a.node.state) - Object.keys(states).indexOf(b.node.state))

    d.add(
        h1(name),
        ...nodes.map(n => create_node_comp(n)),
        div().set_style({ marginBottom: '50px' })
    )

    return d
}

const partitions = {}

for (const slot of sinfo) {
    const { cores, node, nodes, memory, gres, partition, sockets } = slot
    partitions[partition.name] ??= []
    partitions[partition.name].push({
        cores, gres, nodes, memory, node: { state: node.state[0] }
    })
}

for (const [pname, nodes] of Object.entries(partitions)) {
    // create_node_comp(data).add2b()
    create_partition_comp(pname, nodes).add2b()
}
console.log(sinfo[0])

if (sinfo.length == 0) {
    div().add('NO NODES').add2b().set_style({
        textAlign: 'center',
        fontSize: '70px',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: '0.1',
        fontWeight: 'bold',
        marginTop: '200px'
    })
}