import { create_elm, decorate_with_setters, div, h1, h2, h3, hr, span } from './vanille/components.js'

// const raw = (await (await fetch('http://192.168.186.194/get_sinfo.php')).json())
const raw = (await (await fetch('/get_sinfo.php')).json())
const sinfo = raw.sinfo ?? raw.nodes ?? []

const states = {
    "UNKNOWN": ["#ecf0f1", "?"],
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

function create_node_comp(node) {
    const { cores, gres, free_memory: memory } = node
    const d = div('node').set_style({
        background: '#fff', padding: '5px', margin: '1px',
        border: '1px solid #aaa',
        display: 'inline-block', width: 'fit-content',
        position: 'relative'
    })

    const state_name = node.state
    const color = states[state_name][0]
    const icon = states[state_name][1]

    d.set_style({
        background: color
    })

    const ret = span()

    d.add(
        div('viewer').add(
            hr(),
            h3('State: ' + node.state),
            h3('CORES: ' + cores),
            gres.total ?
                h3('GRES: ', create_elm('ul').add(...gres.total.split(',').map(n => create_elm('li').add(n))))
                : '',
            h3('MEM: ' + memory),
        ).set_style({
            position: 'absolute',
            zIndex: 10,
            background: color,
            width: '300px',
            padding: '10px',
        })
    )

    const nodes = [node]

    const node_count = 1

    for (let i = 0; i < node_count; ++i) {
        const name = nodes[i].name
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

    const node_count = nodes.length

    if (name in alias) {
        name = `${name} - <span style="font-size:20px;opacity:0.7">${alias[name]}</span>`
    }
    name += ' - <span style="font-size:20px;opacity:0.5">(' + node_count + ' nodes)</span>'

    nodes.sort((a, b) => Object.keys(states).indexOf(a.state) - Object.keys(states).indexOf(b.state))

    d.add(
        h1(name),
        ...nodes.map(n => create_node_comp(n)),
        div().set_style({ marginBottom: '50px' })
    )

    return d
}

const partitions = {}

for (const node of sinfo) {
    // const { cores, node, nodes, memory, gres, partition, sockets } = slot
    node.state = node.state.toUpperCase()
    const { partitions: pts } = node
    const partition = pts[0]
    partitions[partition] ??= []
    partitions[partition].push(node)
}

console.log(partitions)

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