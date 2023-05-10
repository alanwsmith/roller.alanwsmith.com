const s = {
    base_stats: ["Accuracy", "Damage", "Mastery", "Speed"],
}

const updateState = () => {
    for (k in s) {
        if (window[k] !== undefined) {
            window[k].innerHTML = s[k]
        }
    }
}

const roll = (sides) => {
    const roll_holder = new Uint32Array(1)
    crypto.getRandomValues(roll_holder)
    const raw_roll = roll_holder[0] / (0xffffffff + 1)
    return Math.floor(raw_roll * sides) + 1
}

const get_stat_total = (class_name) => {
    return Array.from(
        document.getElementsByClassName(class_name)
    ).map((element) => {
        return parseInt(element.innerHTML, 10)
    }).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
}

const get_toggle_total = (class_name) => {
    return Array.from(
        document.getElementsByClassName(class_name)
    ).map((element) => {
        if (element.checked) {
            return parseInt(element.dataset.value, 10)
        }
        else {
            return 0
        }
    }).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
}

const get_min_total = (class_name, compare_value) => {
    return Array.from(
        document.getElementsByClassName(class_name)
    ).map((element) => {
        if (compare_value >= parseInt(element.dataset.min, 10)) {
            return parseInt(element.dataset.value, 10)
        }
        else {
            return 0
        }
    }).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
}

const updateValues = () => {
    s.base_stats.forEach((stat) => {
        s[`${stat}_Base`] = get_stat_total(stat)
        s[`${stat}_Mod`] = Math.floor(get_stat_total(stat) / 2)
    })

    s.Interact_Checks = s.Accuracy_Mod
    s.Talk_Checks = s.Speed_Mod
    s.Insight_Checks = s.Accuracy_Mod
    s.Sneak_Checks = s.Mastery_Mod
    s.Search_Checks = s.Mastery_Mod
    s.Traverse_Checks = s.Speed_Mod

}

const roll_accuracy = (event) => {
    s.Gun_Number = parseInt(event.target.dataset.gun, 10)
    s.Gun_Accuracy_Mod = get_stat_total(`Gun_Accuracy_Mod__gun${s.Gun_Number}`)
    s.Toggled_Accuracy = get_toggle_total(`Gun_Accuracy_Mod__gun${s.Gun_Number}_toggle`)
    s.Accuracy_Adjustment = s.Gun_Accuracy_Mod + s.Toggled_Accuracy
    s.Is_Favored_Gun_Type = document.getElementById(`Is_Favored_Gun_Type__gun${s.Gun_Number}`).innerHTML
    if (s.Is_Favored_Gun_Type === "yes") {
        s.Accuracy_Adjustment += s.Accuracy_Mod
    }
    s.Roll_Natural = roll(20)
    s.Roll_Total = s.Roll_Natural + s.Accuracy_Adjustment
    if (s.Roll_Natural == 1) {
        s.Hits = 0
        s.Crits = 0
    } else {
        s.Hits = get_min_total(`hits_count_gun${s.Gun_Number}`, s.Roll_Total)
        s.Crits = get_min_total(`crits_count_gun${s.Gun_Number}`, s.Roll_Total)
    }
    if (s.Roll_Natural == 20) {
        s.Crits += 1
    }
    calculate_hits()
}

const calculate_hits = () => {
    s.Damage_Bonuses = 0

    if (s.Is_Favored_Gun_Type === "yes") {
        s.Favored_Gun_Damage_Mod = s.Damage_Mod
        s.Damage_Bonuses += get_stat_total(`Damage_Mod_Favored`)
    } else {
        s.Favored_Gun_Damage_Mod = 0
    }

    s.Damage_Bonuses += get_stat_total(`Gun_Damage_Mod__gun${s.Gun_Number}`)

    let natural_hit_rolls = []
    for (let i = 0; i < s.Hits; i++) {
        natural_hit_rolls.push(...Array.from(
            document.getElementsByClassName(`DamageDie__gun${s.Gun_Number}`)
        ).map((element) => {
            return roll(parseInt(element.innerHTML, 10))
        }))
    }

    if (natural_hit_rolls.length === 0) {
        s.Natural_Hit_Rolls = 0
    } else {
        s.Natural_Hit_Rolls = natural_hit_rolls
    }

    let natural_crit_rolls = []
    for (let i = 0; i < s.Crits; i++) {
        natural_crit_rolls.push(roll(12))
    }

    if (natural_crit_rolls.length === 0) {
        s.Natural_Crit_Rolls = 0
    } else {
        s.Natural_Crit_Rolls = natural_crit_rolls
    }

    if (natural_crit_rolls.length > 0) {
        s.Damage_Bonuses += get_stat_total(`Gun_Crit_Damage_Mod__gun${s.Gun_Number}`)
    }

    if (s.Roll_Natural === 1) {
        s.Damage_Bonuses = 0
        s.Favored_Gun_Damage_Mod = 0
    }

    if (s.Hits === 0) {
        s.Damage_Bonuses = 0
        s.Favored_Gun_Damage_Mod = 0
    }

    s.Total_Damage = natural_hit_rolls.reduce((a, c) => a + c, 0) +
        natural_crit_rolls.reduce((a, c) => a + c, 0) +
        s.Damage_Bonuses + s.Favored_Gun_Damage_Mod

    updateState()
}

const init = () => {
    Array.from(
        document.getElementsByClassName('accuracy_roller')
    ).forEach((element) => {
        element.addEventListener('click', roll_accuracy)
    })
    updateValues()
    updateState()
}

document.addEventListener("DOMContentLoaded", init);

