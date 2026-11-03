const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxvULGVO7VjZOCMPuZX1o5p56JVdR8WSSKOaFvAsuxbkJGcOPnL7ZuYIUdDvHJTN3Y2/exec';

let cloudData = { area: [], card: [], hr: [], depts: [] };
let occupancyChartInstance = null;

window.onload = () => {
    let script = document.createElement('script');
    script.src = `${APPS_SCRIPT_URL}?callback=handleSheetData`;
    script.onerror = () => {
        alert('تعذر جلب البيانات من الجوجل شيت.');
    };
    document.body.appendChild(script);
};

function handleSheetData(data) {
    cloudData = data || { area: [], card: [], hr: [], depts: [] };
    
    if ((!cloudData.area || cloudData.area.length === 0) && data) {
        let keys = Object.keys(data);
        if (keys.length > 0) cloudData.area = data[keys[0]];
    }

    populateHospitalFilter();
    applyFilters();
}

function cleanName(name) {
    if (!name) return '';
    return name.toString().replace(/[\s\.\-\_]+/g, '').trim().toLowerCase();
}

function getHospitalName(row) {
    let vals = Object.values(row);
    return vals[0] ? vals[0].toString().trim() : '';
}

function populateHospitalFilter() {
    const filter = document.getElementById('hospitalFilter');
    let hospitalsSet = new Set();

    if (cloudData.area) {
        cloudData.area.forEach(row => {
            let hName = getHospitalName(row);
            if (hName && !hName.includes('اسم المستشفي') && !hName.includes('اسم المستشفى')) {
                hospitalsSet.add(hName);
            }
        });
    }

    const hospitals = [...hospitalsSet].filter(Boolean);
    
    filter.innerHTML = '<option value="ALL">جميع المستشفيات (الإجمالي)</option>';
    hospitals.forEach(hosp => {
        let opt = document.createElement('option');
        opt.value = hosp;
        opt.textContent = hosp;
        filter.appendChild(opt);
    });
}

function applyFilters() {
    const selected = document.getElementById('hospitalFilter').value;
    const targetName = cleanName(selected);

    const filterArr = (arr) => {
        if (!arr) return [];
        if (selected === 'ALL') return arr;
        return arr.filter(r => cleanName(getHospitalName(r)) === targetName);
    };

    const fArea = filterArr(cloudData.area);
    const fCard = filterArr(cloudData.card);
    const fHr = filterArr(cloudData.hr);
    const fDepts = filterArr(cloudData.depts);

    let land = 0, build = 0;
    fArea.forEach((row) => {
        let vals = Object.values(row);
        if (vals.length >= 3) {
            land += parseFloat(vals[1] ? vals[1].toString().replace(/,/g, '') : 0) || 0;
            build += parseFloat(vals[2] ? vals[2].toString().replace(/,/g, '') : 0) || 0;
        }
    });

    if (selected === 'ALL') {
        document.getElementById('totalGovernorateArea').innerText = '11,218.50 كم²';
        document.getElementById('populationServed').innerText = '6,051,543 نسمة';
    } else {
        document.getElementById('totalGovernorateArea').innerText = '11,218.50 كم²';
        if (fArea.length > 0) {
            let rowVals = Object.values(fArea[0]);
            let popVal = parseFloat(rowVals[3] ? rowVals[3].toString().replace(/,/g, '') : 0) || 0;
            document.getElementById('populationServed').innerText = popVal > 0 ? popVal.toLocaleString('ar-EG') + ' نسمة' : 'غير متوفرة';
        } else {
            document.getElementById('populationServed').innerText = '0 نسمة';
        }
    }

    document.getElementById('totalLandArea').innerText = land.toLocaleString('ar-EG') + ' م²';
    document.getElementById('totalBuildingArea').innerText = build.toLocaleString('ar-EG') + ' م²';

    const equipConfig = [
        { name: 'ماكينات الغسيل الكلوي', key: 'ماكينات الغسيل الكلوي', icon: 'fa-filter', color: '#0d9488' },
        { name: 'غرف العمليات', key: 'غرف العمليات', icon: 'fa-scalpel', color: '#4f46e5' },
        { name: 'أسرة الافاقة', key: 'اسرة الافاقة', icon: 'fa-bed', color: '#d97706' },
        { name: 'أسرة الاستقبال', key: 'عدد أسرة الاستقبال', icon: 'fa-hospital-user', color: '#059669' },
        { name: 'أشعة مقطعية', key: 'أشعة مقطعية', icon: 'fa-x-ray', color: '#e11d48' },
        { name: 'مناظير', key: 'المناظير', icon: 'fa-microscope', color: '#059669' },
        { name: 'قسطرة القلب', key: 'قسطرة القلب', icon: 'fa-wave-square', color: '#e11d48' },
        { name: 'رنين مغناطيسي', key: 'رنين مغناطيسى', icon: 'fa-magnet', color: '#d97706' }
    ];

    const bedsConfig = [
        { name: 'أسرة الأقسام التخصصية', key: 'اسرة الاقسام التخصصية', icon: 'fa-procedures', color: '#2563eb' },
        { name: 'رعاية مركزة كبار', key: 'رعاية مركزة كبار', icon: 'fa-heart-pulse', color: '#dc2626' },
        { name: 'رعاية قلبية', key: 'رعاية قلبية', icon: 'fa-heartbeat', color: '#ea580c' },
        { name: 'رعاية حروق', key: 'رعاية حروق', icon: 'fa-fire', color: '#d97706' },
        { name: 'رعاية مركزة اطفال', key: 'رعاية مركزة اطفال', icon: 'fa-child', color: '#16a34a' },
        { name: 'رعاية متوسطة اطفال', key: 'رعاية متوسطة اطفال', icon: 'fa-baby', color: '#0284c7' },
        { name: 'رعاية متوسطة كبار', key: 'رعاية متوسطة كبار', icon: 'fa-user-injured', color: '#7c3aed' },
        { name: 'السكتة الدماغية', key: 'السكتة الدماغية', icon: 'fa-brain', color: '#4f46e5' },
        { name: 'رعاية مخ واعصاب', key: 'رعاية مخ واعصاب', icon: 'fa-network-wired', color: '#0d9488' },
        { name: 'عدد أسرة الرعايات', key: 'عدد اسرة الرعايات', icon: 'fa-bed-pulse', color: '#e11d48' },
        { name: 'الحضانات', key: 'الحضانات', icon: 'fa-soap', color: '#0284c7' }
    ];

    // تم تعديل القوى البشرية: تعديل اسم التعاقد الفعلي إلى "التعاقد بسستم الاستعانة" وحذف التعاقد سيستم نهائياً
    const hrConfig = [
        { name: 'طبيب بشري', key: 'طبيب البشري', icon: 'fa-user-doctor', color: '#2563eb' },
        { name: 'التعاقد بسستم الاستعانة', key: 'التعاقد بسستم الاستعانة', icon: 'fa-file-signature', color: '#059669' },
        { name: 'طبيب أسنان', key: 'طبيب اسنان', icon: 'fa-tooth', color: '#0d9488' },
        { name: 'علاج طبيعي', key: 'طبيب علاج طبيعي', icon: 'fa-hands-asl-interpreting', color: '#16a34a' },
        { name: 'صيدلي', key: 'صيدلي', icon: 'fa-pills', color: '#4f46e5' },
        { name: 'تمريض', key: 'تمريض', icon: 'fa-user-nurse', color: '#e11d48' },
        { name: 'إجمالي القوى البشرية', key: 'القوي البشرية', icon: 'fa-users', color: '#7c3aed' }
    ];

    renderList('equipmentListContainer', equipConfig, fDepts);
    renderList('bedsListContainer', bedsConfig, fDepts);
    renderList('hrListContainer', hrConfig, fHr);
    renderChart(fCard);
}

function sumField(dataArray, fieldName) {
    if (!dataArray || dataArray.length === 0) return 0;
    return dataArray.reduce((sum, row) => {
        let key = Object.keys(row).find(k => k.trim().replace(/\s+/g, ' ').includes(fieldName.trim()));
        let val = key ? parseFloat(row[key].toString().replace(/,/g, '')) || 0 : 0;
        return sum + val;
    }, 0);
}

function parsePercent(val) {
    if (!val) return 0;
    if (typeof val === 'number') return val > 1 ? val : Math.round(val * 100);
    if (typeof val === 'string') {
        let clean = val.replace('%', '').trim();
        let num = parseFloat(clean) || 0;
        return num > 1 ? num : Math.round(num * 100);
    }
    return 0;
}

function avgPercentField(dataArray, keyword) {
    if (!dataArray || dataArray.length === 0) return 0;
    let matchingKeys = [];
    if (dataArray.length > 0) {
        matchingKeys = Object.keys(dataArray[0]).filter(k => k.includes(keyword));
    }
    if (matchingKeys.length === 0) return 0;
    let targetKey = matchingKeys[0];

    let total = dataArray.reduce((acc, row) => {
        return acc + parsePercent(row[targetKey]);
    }, 0);
    return Math.round(total / dataArray.length);
}

function renderList(containerId, items, dataSrc) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    items.forEach(item => {
        let count = sumField(dataSrc, item.key);
        container.innerHTML += `
            <div class="metric-item">
                <div class="metric-number" style="direction: ltr; text-align: left;">${count.toLocaleString('ar-EG')}</div>
                <div class="metric-title-group">
                    <span class="metric-name">${item.name}</span>
                    <div class="metric-icon-box" style="background-color: ${item.color};">
                        <i class="fa-solid ${item.icon}"></i>
                    </div>
                </div>
            </div>
        `;
    });
}

function renderChart(fCard) {
    const ctx = document.getElementById('occupancyBarChart').getContext('2d');

    let nicu = avgPercentField(fCard, 'الحضانات');
    let icu = avgPercentField(fCard, 'ICU');
    let picu = avgPercentField(fCard, 'PICU');
    let ccu = avgPercentField(fCard, 'CCU');
    let pimcu = avgPercentField(fCard, 'PIMCU');
    let neuro = avgPercentField(fCard, 'المخ والاعصاب');
    let stroke = avgPercentField(fCard, 'Stroke');
    let internal = avgPercentField(fCard, 'القسم الداخلي');

    if (occupancyChartInstance) occupancyChartInstance.destroy();

    Chart.register(ChartDataLabels);

    occupancyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['الحضانات', 'CCU', 'ICU', 'PICU', 'PIMCU', 'مخ وأعصاب', 'Stroke', 'القسم الداخلي'],
            datasets: [{
                label: 'نسبة الإشغال',
                data: [nicu, ccu, icu, picu, pimcu, neuro, stroke, internal],
                backgroundColor: ['#4d7cfe', '#ec4899', '#10b981', '#84cc16', '#a855f7', '#f59e0b', '#06b6d4', '#6366f1'],
                borderRadius: 6,
                barThickness: 14
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    formatter: (value) => value + '%',
                    font: { family: 'Cairo', weight: 'bold', size: 10 },
                    color: '#1e293b'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 115,
                    ticks: { callback: v => v + '%', stepSize: 25 },
                    grid: { color: '#f1f5f9' }
                },
                y: { 
                    grid: { display: false },
                    ticks: { font: { family: 'Cairo', weight: 'bold', size: 10 } }
                }
            }
        }
    });
}
