/*
 * ALL SITE CONTENT LIVES HERE.
 * Edit this file to update the website; script.js renders everything from SITE.
 * Any list left empty ([]) hides its section and its nav link.
 * Content source: Sanpoom_CV/ (CV PDF, paper PDFs, multimedia ReadMe). Items marked TODO need your input.
 */
const SITE = {
  name: "Sanpoom Punapanont",
  // Exact form of your name as it appears in author lists; it is bolded automatically in Publications.
  authorName: "Sanpoom Punapanont",
  title: "Research Engineer, Vidyasirimedhi Institute of Science and Technology (VISTEC)",
  tagline: "Physical intelligence, compliant and variable-stiffness mechanisms, embodied intelligence, and robot–environment interaction.",
  location: "Bangkok, Thailand",
  // TODO: replace with a real photo at assets/img/profile.jpg and update this path.
  photo: "assets/img/profile-placeholder.svg",
  photoAlt: "Portrait of Sanpoom Punapanont",
  cv: "assets/cv/CV.pdf",

  // Used for <meta> description and Open Graph tags.
  seo: {
    description: "Sanpoom Punapanont, Research Engineer at VISTEC, working on compliant and variable-stiffness robotic mechanisms.",
    image: "assets/img/projects/lithe-joint.jpg",
    url: "" // TODO: your GitHub Pages URL, e.g. https://<username>.github.io/<repo>/
  },

  about:
    "I am a Research Engineer at the Vidyasirimedhi Institute of Science and Technology (VISTEC), where I conduct robotics research in collaboration with industrial partners. " +
    "My work focuses on designing, modeling, and experimentally validating variable-stiffness robotic mechanisms. " +
    "I hold a Bachelor's degree in Robotics and Automation Engineering from the Institute of Field Robotics (FIBO), KMUTT, " +
    "and previously worked as an engineer at Seagate Technology designing mechanical components and precision equipment for automated manufacturing.",

  education: [
    {
      years: "2018 – 2022",
      degree: "Bachelor of Engineering in Robotics and Automation Engineering",
      institution: "Institute of Field Robotics (FIBO), King Mongkut's University of Technology Thonburi (KMUTT)",
      note: "GPA: 3.11",
      logo: "" // optional, e.g. "assets/img/logos/kmutt.png"
    },
    {
      years: "2015 – 2018",
      degree: "High School, Pre-Engineering School",
      institution: "King Mongkut's University of Technology North Bangkok",
      note: "",
      logo: ""
    }
  ],

  experience: [
    {
      years: "2023 – Present",
      role: "Research Engineer",
      organization: "Vidyasirimedhi Institute of Science and Technology (VISTEC)",
      points: [
        "Conduct robotics research in collaboration with industrial partners.",
        "Design and experimentally validate variable-stiffness robotic mechanisms.",
        "Model and simulate variable-stiffness structures and their mechanical behavior."
      ]
    },
    {
      years: "2021 – 2023",
      role: "Engineer",
      organization: "Seagate Technology",
      points: [
        "Designed mechanical components and precision equipment for automated manufacturing processes.",
        "Supported equipment development and functional testing for production lines."
      ]
    }
  ],

  // Each project gets its own detail page: project.html?id=<id>.
  // model: optional .glb file shown as an interactive 3D viewer (see README). image is the fallback/poster.
  // publicationIds: ids from the publications list below, shown on the detail page.
  projects: [
    {
      id: "mach-joint",
      title: "MACH-joint: Multi-Axis Compliant Helical Joint",
      description: "A compact helical joint whose stiffness adapts passively through fluid–structure interaction, demonstrated as an adaptive-stiffness flipper for underwater propulsion.",
      image: "assets/img/projects/mach-joint.jpg",
      imageAlt: "CAD rendering of the MACH-joint showing the helical joint, the twist-constrained compliant coupling, and the assembled joint with helix shaft and magnetic encoder",
      model: "assets/models/mach-joint.glb",
      modelAlt: "Interactive 3D model of the adaptive-stiffness flipper built on the MACH-joint",
      tags: ["Compliant mechanism", "Variable stiffness", "Underwater locomotion"],
      overview: "The MACH-joint integrates a helical mechanism with a twist-constrained compliant coupling to realize geometry-driven, multi-dimensional variable stiffness. Stiffness modulation emerges passively from the applied torque that controls the helical twist angle, so the joint adapts its mechanical response without additional actuation or control complexity. Implemented as an adaptive-stiffness flipper (ASF), it passively adapts its stiffness through fluid–structure interaction under constant-frequency actuation.",
      highlights: [
        "Multi-axis variable-stiffness compliant mechanism built on a helical structure.",
        "Linear stiffness scales proportionally with geometric dimension, while bending stiffness scales cubically.",
        "The power stroke generates 30% more impulse than the recovery stroke.",
        "15.32x and 3.93x faster than rigid and fixed-stiffness flippers, respectively."
      ],
      videos: [
        { url: "https://www.youtube.com/watch?v=1siruLQ7Fvk", title: "Free-swimming locomotion of the adaptive-stiffness flipper" }
      ],
      links: {
        paper: "",
        video: "https://www.youtube.com/watch?v=1siruLQ7Fvk",
        github: "https://anonymous.4open.science/r/MACH-joint", // open-source interactive simulator
        project: ""
      },
      publicationIds: ["mach-joint-tro"]
    },
    {
      id: "lithe-joint",
      title: "LITHE-joint: Variable Stiffness Spherical Contact Joint",
      description: "A 2-DOF compliant spherical joint with stiffness set by a single pneumatic artificial muscle, used as the spine of a quadruped to steer its walking direction.",
      image: "assets/img/projects/lithe-joint.jpg",
      imageAlt: "IROS 2025 graphic abstract for the LITHE-joint showing the joint, its control system, the stiffness profile plot, and directional walking of the quadruped robot",
      model: "assets/models/lithe-joint.glb",
      modelAlt: "Interactive 3D model of the quadruped robot with a LITHE-joint spine",
      tags: ["Variable stiffness", "Pneumatic artificial muscle", "Under-actuated robot"],
      overview: "The LITHE-joint is a compact 2-DOF compliant spherical contact joint that combines a spherical rolling joint and a cross-axis flexural pivot with a parallelogram flexure mechanism. A single pneumatic artificial muscle (PAM) adjusts its stiffness, letting the joint redistribute torque and bending angle through its passive body dynamics. Embedded as the spine of an under-actuated quadruped, reflex-based stiffness control steers the robot's walking direction without changing leg speed or position.",
      highlights: [
        "One PAM actuator controls the stiffness of a 2-DOF joint (0.5 actuators per degree of freedom).",
        "Stiffness of up to 0.38 Nm/rad with a stiffness bandwidth of 0.1967 Nm/rad over 0.5–4 bar.",
        "Range of motion of π/2 radians.",
        "Directional locomotion through asymmetric body stiffness without changing the basic actuation pattern."
      ],
      videos: [
        { url: "https://youtu.be/gBokn-a40EQ", title: "Directional locomotion of the quadruped with a LITHE-joint spine" },
        { url: "https://youtu.be/t08CrN0bsv0", title: "Stiffness profile experiment" },
        { url: "https://youtu.be/fI0hDl4UcKo", title: "Bending direction control via phase-specific PAM activation" }
      ],
      links: {
        paper: "https://doi.org/10.1109/IROS60139.2025.11247107",
        video: "https://youtu.be/gBokn-a40EQ",
        github: "",
        project: ""
      },
      publicationIds: ["lithe-joint-iros25"]
    },
    {
      id: "refine-bot",
      title: "REFINE-bot: Furnace Cleaning Robot",
      description: "A tube-clamping robot with adaptive force control that removes scale from furnace radiant coils, deployed in a real fired heater.",
      image: "assets/img/projects/refine-bot.jpg",
      imageAlt: "REFINE-bot clamped on a furnace tube, with callouts for the body module, pressing module with brush tools, soft pads, and a cleaned tube in a real furnace",
      model: "",
      modelAlt: "",
      tags: ["Field robotics", "Climbing robot", "Adaptive force control"],
      overview: "Scale accumulating on the radiant coils of oil-and-gas furnaces reduces heat-transfer efficiency and increases energy consumption. REFINE-bot is a robotic system for descaling fired heaters: an adaptable clamping mechanism fits vertical and horizontal tubes in narrow tube-to-tube and wall-to-tube gaps, and an adaptive force control adjusts the cleaning tool online to uneven scale heights. It was deployed in a real furnace and compared against traditional manual descaling.",
      highlights: [
        "Adaptable clamping for vertical and horizontal tubes of 3–8 inch diameter.",
        "Three cleaning tools evaluated under simulated hard scale; the 1-inch wire cup brush removed 431.1 µm of scale, the highest descaling rate.",
        "Better cleaning performance than manual descaling in a real furnace, measured by scale thickness and infrared thermal imaging.",
        "Ultrasonic thickness measurements showed no significant loss in tube wall thickness."
      ],
      videos: [
        { url: "https://youtu.be/j2YtmNmYR8g", title: "REFINE-bot testing in a real furnace" }
      ],
      links: {
        paper: "https://doi.org/10.1109/IROS60139.2025.11247011",
        video: "https://youtu.be/j2YtmNmYR8g",
        github: "",
        project: ""
      },
      publicationIds: ["refine-bot-iros25"]
    }
  ],

  // id: used by projects[].publicationIds. venue: short tag shown in brackets. status: optional label such as "Under review".
  publications: [
    {
      id: "mach-joint-tro",
      year: 2026,
      venue: "T-RO",
      status: "Under review",
      title: "A Multi-Axis Compliant Helical Joint for Embodied Adaptable Stiffness and Environment-Driven Interaction",
      authors: ["Sanpoom Punapanont†", "Run Janna†", "Harn Sison", "Poramate Manoonpong"],
      details: "Manuscript under review at IEEE Transactions on Robotics (T-RO). Submitted June 2026. † Equal contribution.",
      abstract: "Interaction with uncertain environments remains a fundamental challenge in robotics. Morphological computation offers a promising strategy by leveraging structural compliance to simplify control while maintaining adaptability. Following this principle, this study proposes a compact multi-axis compliant helical joint that features embodied adaptable stiffness. By physically integrating a helical mechanism with a twist-constrained structure, the joint realizes geometry-driven, multi-dimensional variable stiffness. The proposed design follows a stiffness scaling law in which linear stiffness scales proportionally with geometric dimension, while bending stiffness scales cubically. All stiffness modulation emerges passively from the applied torque that controls the helical twist angle, enabling adaptive mechanical responses without additional actuation or control complexity. To demonstrate joint functionality and performance, it is implemented as an adaptive-stiffness flipper and experimentally evaluated in a hydrodynamic environment under constant-frequency actuation. The joint structure passively adapts its stiffness through fluid–structure interaction and automatically produces asymmetric drag-induced impulses, with the power stroke generating 30% more impulse than the recovery stroke. This leads to 15.32x and 3.93x faster speeds than traditional rigid and fixed-stiffness flippers, respectively. The results demonstrate that the proposed mechanism can exploit coupled structure–environment dynamics to generate net directional forces without active stiffness control, highlighting its potential for adaptive robotic systems operating in uncertain environments.",
      links: {
        paper: "",
        video: "https://www.youtube.com/watch?v=1siruLQ7Fvk",
        code: "https://anonymous.4open.science/r/MACH-joint"
      },
      embedVideo: false
    },
    {
      id: "lithe-joint-iros25",
      year: 2025,
      venue: "IROS-2025",
      title: "LITHE-joint: Variable Stiffness Compliant Spherical Contact Joint in an Under-Actuated System",
      authors: ["Sanpoom Punapanont†", "Run Janna†", "Harn Sison", "Poramate Manoonpong"],
      details: "2025 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS), Hangzhou, China, pp. 5228–5235. † Equal contribution.",
      abstract: "The concept of morphological computation (MC) is applied in the robotics field to improve the design and reduce the complexity of control systems. The MC uses mechanical intelligence, where stiffness properties play an important role as constraints to enhance system flexibility and to store elastic energy. This can reduce the number of required actuators. According to the MC principle, this work proposes LITHE-joint: variable stiffness compliant spherical contact joint in an under-actuated system. This compact design for a 2-degrees of freedom (DOF) compliant spherical contact joint with controllable stiffness uses a pneumatic artificial muscle (PAM). This joint requires only one PAM actuator to control stiffness in a 2-DOF system, achieving a stiffness of up to 0.38 Nm/rad with a bandwidth of 0.1967 Nm/rad. With its variable stiffness properties, the joint is able to adapt its bending behavior, enabling energy redistribution of torque and angle. The modulation of torque and bending angle is governed by joint stiffness and the passive body dynamics. The benefits of the passive, compliant joint with a variable stiffness property are demonstrated by using as the spine of an under-actuated robot, controlling the passive bending of the body and the robot's walking direction using the adjustable stiffness.",
      links: {
        paper: "https://doi.org/10.1109/IROS60139.2025.11247107",
        video: "https://youtu.be/gBokn-a40EQ",
        code: ""
      },
      embedVideo: true
    },
    {
      id: "refine-bot-iros25",
      year: 2025,
      venue: "IROS-2025",
      title: "REFINE-bot: Furnace Cleaning Robot for Heat-transfer Efficiency Improvement",
      authors: ["Sanpoom Punapanont†", "Thipawan Pairam†", "Wasuthorn Ausrivong†", "Poramate Manoonpong"],
      details: "2025 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS). † Equal contribution.",
      abstract: "In the oil and gas industry, scale accumulation on radiant coils within furnaces significantly reduces heat-transfer efficiency, leading to increased energy consumption. This paper introduces the REFINE-bot, a robotic system developed to improve the descaling process and operational efficiency in fired heaters. Unlike existing solutions which are mainly designed for specific tube sizes and positions and focused on inspection, the REFINE-bot integrates an adaptable clamping mechanism that adapts to both vertical and horizontal tubes of varying diameters (3\"–8\"), even in complex environments with narrow tube-to-tube and wall-to-tube gaps. An adaptive force control is also developed to online adjust the position of the cleaning relative to the tube surface to address uneven scale heights. We evaluated three different cleaning tools—a Knot End Brush, Wire Cup Brush, and Sandpaper—under simulated hard scale conditions in a lab environment. This evaluation revealed the cleaning tools' limitations and helped to identify optimal safety parameters to prevent tube damage. The results showed that the 1-inch Wire Cup Brush, removing 431.1 µm of scale, achieved the highest descaling rate among the tested tools. The robot was successfully deployed in a real furnace setting to test its clamping and cleaning mechanisms on the actual scale. The real-world results demonstrated superior cleaning performance on the radiant coils of a furnace compared to traditional manual descaling methods, as evaluated by measured reductions in scale thickness and infrared thermal imaging. Furthermore, ultrasonic thickness measurements (UTM) were performed and indicated that there was no significant loss in wall thickness after the on-site experiments.",
      links: {
        paper: "https://doi.org/10.1109/IROS60139.2025.11247011",
        video: "https://youtu.be/j2YtmNmYR8g",
        code: ""
      },
      embedVideo: true
    },
    {
      id: "arthroscopy-aip24",
      year: 2024,
      venue: "AIP Conf. Proc.",
      title: "Development of 7-degree-of-freedom passive manipulator for arthroscopy",
      // TODO: full author list (the CV only gives "Romtrairat, P., et al.").
      authors: ["P. Romtrairat", "et al."],
      details: "AIP Conference Proceedings, Vol. 3086, No. 1. AIP Publishing LLC, 2024.",
      abstract: "", // TODO: add abstract
      links: {
        paper: "", // TODO: add DOI link
        video: "",
        code: ""
      },
      embedVideo: false
    }
  ],

  // Each group renders as a row of chips. A group with an empty label shows chips only.
  skills: [
    { group: "Hardware", items: ["CAD design (SolidWorks, Fusion 360)", "Compliant mechanism design", "Pneumatic systems"] },
    { group: "Modeling & Computation", items: ["MATLAB", "Python", "Kinematic and dynamic modeling"] },
    { group: "Languages", items: ["Thai (native)", "English (B2, IELTS 6.5)"] }
  ],

  awards: [
    { year: "2025", title: "VISTEC honors for outstanding achievements" },
    { year: "2019 – 2021", title: "KMUTT Full Scholarship for Creativity and Innovation" }
  ],

  // Optional photo gallery: { src: "assets/img/highlights/x.jpg", alt: "...", caption: "..." }
  highlights: [],

  // Leave a value empty ("") to hide that icon.
  contact: {
    email: "p.sanpoom@gmail.com",
    github: "",       // TODO: e.g. https://github.com/<username>
    linkedin: "",     // TODO
    scholar: "",      // TODO: Google Scholar profile URL
    orcid: ""         // TODO: https://orcid.org/xxxx-xxxx-xxxx-xxxx
  }
};
