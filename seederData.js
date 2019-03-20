const schools = [
    {name: "School of Engineering"},
    {name: "School of Built Environment"},
    {name: "School of Industrial and Fine Arts"},
];

const departments = [
    {
        school: schools[0].name,
        departs: [
            {name: "Civil and Environmental Engineering"},
            {name: "Electrical and Computer Engineering"},
            {name: "Mechanical Engineering",}
        ]
    },
    {
        school: schools[1].name,
        departs: [
            {name: "Architecture and Physical planning"},
            {name: "Construction Economics and Management"},
            {name: "Geomatics and Land Management",}
        ]
    },
    {
        school: schools[2].name,
        departs: [
            {name: "Fine Art"},
        ]
    },
];

const courses = [
    {
        depart: departments[0].departs[0].name,
        courses: [
            {name: "Master of Science in Civil Engineering"},
        ]
    },
    {
        depart: departments[0].departs[1].name,
        courses: [
            {name: "Master of Science in Telecommunication Engineering"},
        ]
    },
    {
        depart: departments[0].departs[2].name,
        courses: [
            {name: "Master of Science in Technology Innovation and Industrial Development"},
        ]
    },
    {
        depart: departments[1].departs[0].name,
        courses: [
            {name: "Master of Architecture"},
        ]
    },
    {
        depart: departments[1].departs[1].name,
        courses: [
            {name: "Master of Science in Construction Management"},
        ]
    },
    {
        depart: departments[1].departs[2].name,
        courses: [
            {name: "Master of Science in Geo-Information Science and Technology"},
        ]
    },
    {
        depart: departments[2].departs[0].name,
        courses: [
            {name: "Master of Arts in Fine Art"},
        ]
    },
];

const students = [
    {
        bioData: {name: "Rowan Nikolaus", netID: "rnikolaus@cedat.mak.ac.ug", phoneNumber: "1-516-716-9832"},
    },
    {
        bioData: {name: "Kassandra Haley", netID: "khaley@cedat.mak.ac.ug", phoneNumber: "1-516-715-4892"},
    },
    {
        bioData: {name: "Alvaro Cabrera", netID: "acabrera@cedat.mak.ac.ug", phoneNumber: "1-516-981-0981"},
    },
    {
        bioData: {name: "Tomasz Ducin", netID: "tducin@cedat.mak.ac.ug", phoneNumber: "1-516-981-0981"},
    },
    {
        bioData: {name: "Ajay Karat", netID: "akarat@cedat.mak.ac.ug", phoneNumber: "1-516-450-1238"},
    },
    {
        bioData: {name: "Vernice Abernathy", netID: "vbernathy@cedat.mak.ac.ug", phoneNumber: "1-516-520-0679"},
    },
    {
        bioData: {name: "Sheila Bayer", netID: "bsheila@cedat.mak.ac.ug", phoneNumber: "1-516-156-0836"},
    },
    {
        bioData: {name: "Jeff Bogisich", netID: "jbogisich@cedat.mak.ac.ug", phoneNumber: "1-516-455-0400"},
    },
];

module.exports = {schools, departments, courses, students};