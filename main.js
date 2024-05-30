import { create_elm, decorate_with_setters, div, divabs, h1, h2, h3, hr, listen_to, span } from './vanille/components.js'

// const raw = (await (await fetch('http://192.168.186.194/get_sinfo.php')).json())

const states = {
    "UNKNOWN": ["#ecf0f1", "?"],
    "IDLE": ["#2ecc71", "…"],
    "PLANNED": ["#1abc9c", "⊠"],
    "MIXED": ["#f1c40f", "⧋"],
    "ALLOCATED": ["#3498db", "⊗"],
    "COMPLETING": ["#9b59b6", "𔗫"],
    "DOWN": ["#e74c3c", "🕱"],
}

const state_css = {
    'RESERVED': { borderColor: '#2c3e50', borderStyle: 'dashed' },
    'DRAIN': { borderColor: '#c0392b' },

    'DOWN': { borderColor: '#000', borderStyle: 'dashed' },
    'NOT_RESPONDING': { background: '#636e72' },
    'UNKNOWN': { background: '#bdc3c7' },

    'IDLE': { background: '#2ecc71' },
    'PLANNED': { background: '#3498db' },

    'MIXED': { background: '#f1c40f' },
    'ALLOCATED': { background: '#9b59b6' },
    'COMPLETING': { background: '#8e44ad' },

    'FAIL': { background: '#e74c3c' },

}

const alias = {
    gpu_p13: 'V100 (16Go / 32Go)',
    gpu_p2: 'V100 (32Go)',
    gpu_p2s: 'V100 (360Go)',
    gpu_p2l: 'V100 (720Go)',
    gpu_p5: 'A100 (80Go)',
}

function create_node_comp(node) {
    const { name, states } = node

    const node_div = div('node').set_style({
        background: '#fff', padding: '10px', margin: '3px',
        border: '2px solid #aaa',
        display: 'inline-block', width: 'fit-content',
        position: 'relative'
    })

    const inner_div = div('viewer').set_style({
        position: 'absolute',
        zIndex: 10,
        width: '300px',
        padding: '10px',
        border: '1px solid #aaa'
    }).add2(node_div)

    inner_div.add(h1(name), hr())

    function set_data(name, value, css = {}) {
        if (!value) return
        inner_div.add(
            div().add(
                h3(name).set_style({ marginBottom: '5px' }),
                div().add('' + value).set_style({ marginLeft: '20px' }),
            ).set_style(css)
        )
    }

    set_data('States', node.states.join('</br>'))
    set_data('Addr', node.address)
    set_data('GRes', node.gres.split(',').join('</br>'))
    set_data('GRes used', node.gres_used.split(',').join('</br>'))
    set_data('Compute', ['CPUs - ' + node.idle_cpus + '/' + node.cpus, 'Cores - ' + node.cores].join('</br>'))
    set_data('ERROR', node.reason, { color: '#c0392b' })

    // for (const [prop, val] of Object.entries(node)) {
    //     set_data(prop, val)
    // }

    for (const state of states) {
        node_div.set_style(state_css[state] ?? {})
        inner_div.set_style(state_css[state] ?? {})
    }

    return node_div
}

// function create_node_comp(node) {
//     const { cores, gres, free_memory: memory, cpus } = node
//     const d = div('node').set_style({
//         background: '#fff', padding: '5px', margin: '1px',
//         border: '1px solid #aaa',
//         display: 'inline-block', width: 'fit-content',
//         position: 'relative'
//     })

//     const state_name = node.state
//     const color = states[state_name][0]
//     const icon = states[state_name][1]

//     d.set_style({
//         background: color
//     })

//     const ret = span()

//     d.add(
//         div('viewer').add(
//             hr(),
//             h3('State: ' + node.state),
//             h3('Archi: ' + node.architecture),
//             h3('CPUs: ' + cpus),
//             h3('CORES: ' + cores),
//             h3('OS: ' + node.operating_system),
//             gres ?
//                 h3('GRES: ', create_elm('ul').add(...gres.split(',').map(n => create_elm('li').add(n))))
//                 : '',
//             h3('MEM: ' + memory),
//         ).set_style({
//             position: 'absolute',
//             zIndex: 10,
//             background: color,
//             width: '300px',
//             padding: '10px',
//         })
//     )

//     if (node.state_flags.includes('DRAIN')) {
//         d.set_style({
//             borderColor: 'red'
//         })
//     }

//     const nodes = [node]

//     const node_count = 1

//     for (let i = 0; i < node_count; ++i) {
//         const name = nodes[i].name
//         const c = d.clone()
//         decorate_with_setters(c.childNodes[0])
//         c.childNodes[0].prepend(h1(icon + ' ' + name))
//         ret.add(c)
//     }

//     // d.add(nodes.nodes.length
//     //     // h2(icon + ' ' + node.state.join(' ')),
//     //     // hr(),
//     //     // h3('CORES: ' + cores.maximum),
//     //     // h3('GRES: ', create_elm('ul').add(...gres.total.split(',').map(n => create_elm('li').add(n)))),
//     //     // h3('MEM: ' + memory.maximum),
//     //     // h3('NODES: ' + nodes.nodes.length),
//     // )

//     return ret
// }

function create_partition_comp(name, nodes) {

    const d = div()

    const node_count = nodes.length

    if (name in alias) {
        name = `${name} - <span style="font-size:20px;opacity:0.7">${alias[name]}</span>`
    }
    name += ' - <span style="font-size:20px;opacity:0.5">(' + node_count + ' nodes)</span>'

    nodes.sort((a, b) => Object.keys(states).indexOf(a.states[0]) - Object.keys(states).indexOf(b.states[0]))

    d.add(
        h1(name),
        ...nodes.map(n => create_node_comp(n)),
        div().set_style({ marginBottom: '50px' })
    )

    return d
}

const datadiv = div().add2b().set_style({ position: 'relative' })

function draw_sinfo() {

    console.log(name)

    datadiv.clear()

    datadiv.add(
        div().add(name).set_style({
            fontSize: '70px',
            fontWeight: 'bold',
            marginLeft: '-100px',
            opacity: 0.1,
        })
    )

    const logo_size = 70
    datadiv.add(
        divabs().set_style({
            width: logo_size + 'px', height: logo_size + 'px',
            top: '7px',
            left: -(100 + logo_size + 20) + 'px',
            background: 'url(' + logo + ')',
            backgroundSize: 'contain'
        })
    )


    const partitions = {}

    for (const node of nodes) {
        node.states = [node.state, ...node.state_flags].map(s => s.toUpperCase())
        const { partitions: pts } = node
        const partition = pts[0]
        partitions[partition] ??= []
        partitions[partition].push(node)
    }

    console.log(partitions)

    for (const [pname, nodes] of Object.entries(partitions)) {
        create_partition_comp(pname, nodes).add2(datadiv)
    }

    if (nodes.length == 0) {
        div().add('NO NODES').add2(datadiv).set_style({
            textAlign: 'center',
            fontSize: '70px',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: '0.1',
            fontWeight: 'bold',
            marginTop: '200px'
        })
    }
}

let nodes = []
let name = null
let logo = null
let interval = null

listen_to(() => nodes, draw_sinfo)

async function reload_sinfo() {
    const DATA = (await (await fetch('/get_sinfo.php')).json())

    name = DATA.name
    logo = DATA.logo

    console.log(DATA)

    nodes = DATA.sinfo.sinfo ?? DATA.sinfo.nodes ?? []

    if (!interval) interval = setInterval(reload_sinfo, DATA.interval * 1000)

}
reload_sinfo()