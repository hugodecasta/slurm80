import { alink, br, button, create_elm, decorate_with_setters, div, divabs, divabscenter, h1, h2, h3, hr, input, listen_to, p, span } from './vanille/components.js'
import { post_json } from './vanille/fetch_utils.js'

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

const job_color_map = {
    'RUNNING': '#f1c40f',
    'PENDING': '#636e72',
    'CANCELLED': '#2c3e50',
    'FAILED': '#e74c3c',
    'COMPLETED': '#1abc6b'
}

const state_css = {
    'RESERVED': { borderColor: '#2c3e50', borderStyle: 'dashed' },
    'DRAIN': { borderColor: '#c0392b' },

    'DOWN': { borderColor: '#000', background: '#fff' },
    'NOT_RESPONDING': { background: '#636e72' },
    'UNKNOWN': { background: '#bdc3c7' },

    'IDLE': { background: '#2ecc71' },
    'PLANNED': { background: '#3498db' },

    'MIXED': { background: '#f1c40f' },
    'ALLOCATED': { background: '#9b59b6' },
    'COMPLETING': { background: '#e67e22' },

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
        width: '400px',
        padding: '10px',
        border: '1px solid #aaa'
    }).add2(node_div)

    inner_div.add(h1(name), hr())

    if (states.includes('DOWN')) {
        inner_div.add(
            button('Reload node', () => fetch('reload_node.php?nodeName=' + encodeURI(name))),
            hr(),
        )
    }

    for (const state of states) {
        node_div.set_style(state_css[state] ?? {})
        inner_div.set_style(state_css[state] ?? {})
    }

    function set_data(name, value, css = {}) {
        if (!value) return
        inner_div.add(
            div().add(
                h3(name).set_style({ marginBottom: '5px' }),
                div().add('' + value).set_style({ marginLeft: '20px' }),
            ).set_style(css)
        )
    }

    function set_disp_array(name, total, used, css = {}) {
        if (total == 0) return

        const rest = total - used

        inner_div.add(
            div().add(
                h3(name + ' - (' + used + '/' + total + ')').set_style({ marginBottom: '5px' }),
                div().add(
                    ...Array(total).fill(0).map((_, i) => div().set_style({
                        display: 'inline-block', padding: '5px', background: i < used ? '#9b59b6' : node_div.style.background,
                        margin: '1px', borderRadius: '1000px', border: '1px solid #fff'
                    }))
                ).set_style({ marginLeft: '20px' }),
            ).set_style(css)
        )
    }

    function handle_gres_name(name) {
        const sp = name.split(':')
        const count = sp.pop()
        return [sp.join(':'), count]
    }

    const gres_data = Object.fromEntries(node.gres.split(',').map(handle_gres_name))
    const gresused_data = Object.fromEntries(node.gres_used.split(',').map(handle_gres_name))

    const gres = Object.fromEntries(
        Object.entries(gres_data).map(([name, total]) => [name, { total: parseInt(total), used: parseInt(gresused_data[name]) }])
    )

    const gpu_names = Object.keys(gres).filter(n => n.includes('gpu'))

    set_data('States', node.states.join('</br>'))
    set_data('Addr', node.address)
    // set_data('GRes', node.gres.split(',').join('</br>'))
    // set_data('GRes used', node.gres_used.split(',').join('</br>'))
    for (const gpu_name of gpu_names) {
        set_disp_array(gpu_name.toUpperCase() + 's', gres[gpu_name]?.total, gres[gpu_name]?.used)
    }
    set_disp_array('CPUs', node.cpus, node.cpus - node.idle_cpus)
    // set_data('Compute', ['CPUs - ' + node.idle_cpus + '/' + node.cpus, 'Cores - ' + node.cores].join('</br>'))
    set_data('ERROR', node.reason, { color: '#c0392b' })

    // for (const [prop, val] of Object.entries(node)) {
    //     set_data(prop, val)
    // }

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
        .set_style({
            border: '2px solid #ddd',
            paddingLeft: '10px'
        })

    const node_count = nodes.length

    if (name in alias) {
        name = `${name} - <span style="font-size:20px;opacity:0.7">${alias[name]}</span>`
    }
    name += ' - <span style="font-size:20px;opacity:0.5">(' + node_count + ' nodes)</span>'

    nodes.sort((a, b) => Object.keys(states).indexOf(a.states[0]) - Object.keys(states).indexOf(b.states[0]))

    d.add(
        h1(name),
        div()
            .add(
                ...nodes.map(n => create_node_comp(n)),
            ),
        div().set_style({ marginBottom: '50px' })
    )

    return d
}

const datadiv = div().add2b().set_style({ position: 'relative' })
const jobs_div = div().add2b().fixed().set_style({
    right: '0px', top: '0px', width: '300px', height: '100%',
    borderLeft: '2px solid #ddd',
    padding: '0px 10px',
    background: '#fff',
    overflowY: 'auto',
    overflowX: 'hidden'
})
const bottom_div = div().fixed().add2b().set_style({
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    padding: '10px',
    background: '#fff'
})

bottom_div.add(
    button('Account request', open_acount_request)
)

function open_acount_request() {

    const request = { firstname: '', lastname: '', mail: '', pub: '' }

    const overlay = divabscenter().add2b().set_style({
        padding: '20px',
        background: '#fff',
        border: '5px solid #000',
    }).add(
        h1('Account request'),
        hr(),
        h2('Firstname'),
        input('', 'text', (name) => request.firstname = name).set_style({ width: '100%' }),
        br(),
        h2('Lastname'),
        input('', 'text', (name) => request.lastname = name).set_style({ width: '100%' }),
        br(),
        h2('eMail'),
        input('', 'text', (mail) => request.mail = mail).set_style({ width: '100%' }),
        br(),
        h2('Generate ssh public key (paste)'),
        input('', 'password', (pub) => request.pub = pub).set_style({ width: '100%' }),
        hr(),
        button('Cancel', () => overlay.remove()),
        button('Send', async () => {
            console.log(request)
            let ok = false
            try {
                ok = await post_json('/account_request.php', request)
            } catch (e) {
            }
            if (ok) alert('Request sent !')
            else alert('Request send failed ! Contact IT support')
            overlay.remove()
        })
    )
}

function draw_sinfo() {

    datadiv.clear()

    datadiv.add(
        div().add(name).set_style({
            fontSize: '70px',
            fontWeight: 'bold',
            marginLeft: '-50px',
            marginBottom: '30px',
            opacity: 0.1,
        })
    )

    const logo_size = 70
    datadiv.add(
        divabs().set_style({
            width: logo_size + 'px', height: logo_size + 'px',
            top: '7px',
            left: -(50 + logo_size + 20) + 'px',
            background: 'url(' + logo + ')',
            backgroundSize: 'contain'
        })
    )


    const partitions = {}

    for (const node of nodes) {
        node.states = [node.state, ...node.state_flags].map(s => s.toUpperCase())
        const { partitions: pts } = node
        for (const partition of pts) {
            partitions[partition] ??= []
            partitions[partition].push(node)
        }
    }

    const dd = div().add2(datadiv).add_classe('container')
    for (const [pname, nodes] of Object.entries(partitions)) {
        create_partition_comp(pname, nodes).add2(dd).add_classe('item')
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

function job_comp(job) {
    const {
        job_id, name, job_state,
        partition, nodes,
        cpus, tres_per_node,
        user_name,
        start_time, end_time,
        current_working_directory, command
    } = job

    const job_div = div().set_style({
        width: 'calc(100% - 34px)',
        padding: '10px',
        margin: '5px',
        border: '2px solid #ddd',
    })

    function ressource_comp(partition, nodes, cpus, tres_per_node) {
        const CPUs = cpus
        const GPUs = parseInt(tres_per_node.split(':').pop())
        return div().flex().add(
            div()
                .padding({ right: 10 })
                .set_style({
                    borderRight: '2px solid #ddd',
                })
                .add(
                    h2(nodes).margin({ top: 0, bottom: 0 }),
                    p(`(${partition})`).margin({ top: 0, bottom: 0 }).set_style({ opacity: 0.5 }),
                ),
            div()
                .padding({ left: 10 })
                .add(
                    p('CPUs: ', span(CPUs).set_style({ color: '#0098ac', fontWeight: 'bold' })).margin({ bottom: 0 }),
                    p('GPUs: ', span(GPUs).set_style({ color: '#64b100', fontWeight: 'bold' })).margin({ top: 5 }),
                )
        )
    }

    function time_since_str(start_time, end_time) {
        const now = Date.now() / 1000
        const used_now = now > end_time ? end_time : now
        const diff = used_now - start_time
        const days = Math.floor(diff / (60 * 60 * 24))
        const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60))
        const minutes = Math.floor((diff % (60 * 60)) / 60)
        const seconds = Math.floor(diff % 60)
        return `${days}d ${hours}h ${minutes}m ${seconds}s`
    }

    const text = div().add(
        span('by ').set_style({ color: '#aaa' }),
        span(user_name).set_style({ textDecoration: 'underline' }),
        span(' '),
        span('since ').set_style({ color: '#aaa' }),
        span(time_since_str(start_time, end_time)).set_style({ textDecoration: 'underline' }),
    )

    job_div.add(
        h2(`${job_id} - "${name}"`).margin({ top: 0 }),
        text.margin({ top: -15, bottom: 20 }),
        ressource_comp(partition, nodes, cpus, tres_per_node),
        // h3(`Working Directory: ${current_working_directory}`),
        // h3(`Command: ${command}`)
    )

    job_div.set_style({
        borderColor: job_color_map[job_state]
    })

    return job_div
}

const state_order = [
    'RUNNING',
    'FAILED',
    'PENDING',
    'CANCELLED',
    'COMPLETED',
]

function draw_jobs() {
    jobs_div.clear().add(
        h1('Jobs'),
        ...jobs
            .sort((a, b) => state_order.indexOf(a.job_state) - state_order.indexOf(b.job_state))
            // .filter(job => !['COMPLETED', 'CANCELLED'].includes(job.job_state))
            .map(job => job_comp(job))
    )
}

let nodes = []
let jobs = []
let name = null
let logo = null
let interval = null

listen_to(() => nodes, draw_sinfo)
listen_to(() => jobs, draw_jobs)

async function reload_sinfo() {
    const DATA = (await (await fetch('/get_sinfo.php')).json())

    name = DATA.name
    logo = DATA.logo

    nodes = DATA.sinfo.sinfo ?? DATA.sinfo.nodes ?? []
    jobs = DATA.squeue.jobs ?? []
    console.log(jobs)

    if (!interval) interval = setInterval(reload_sinfo, DATA.interval * 1000)

}
reload_sinfo()