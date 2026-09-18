"use client";
import React, { useState } from 'react';
import { Calculator, Download, Trash2, Plus, X, Info } from 'lucide-react';
import { useSelectionsStore } from '@/store/selectionsStore';
import {
  VACUUM_CONFIG_FIELD,
  VACUUM_QUOTE_ITEMS_FIELD,
  VACUUM_STATS_FIELD,
} from '@/lib/vacuum/vacuumQuote';

// Complete price data
const priceData = {
  centralUnits: [
    {
      partNumber: "VAC-10HP",
      name: "Eurovac III - 10 HP & 30\" Sep Detailed Vacuum System for 3-4 users",
      price: 13745.00,
      minArches: 3,
      maxArches: 4,
      hp: "10HP",
      type: "single"
    },
    {
      partNumber: "VAC-15HP",
      name: "Eurovac III - 15 HP & 30\" Sep Detailed Vacuum System for 4-5 users",
      price: 13890.00,
      minArches: 4,
      maxArches: 5,
      hp: "15HP",
      type: "single"
    },
    {
      partNumber: "VAC-20HP",
      name: "Eurovac III - 20 HP & 30\" Sep Detailed Vacuum System for 5-6 users",
      price: 15339.00,
      minArches: 5,
      maxArches: 6,
      hp: "20HP",
      type: "single"
    },
    {
      partNumber: "VAC-25HP",
      name: "Eurovac III - 20 HP Vacuum System for 7-8 users",
      price: 17103.00,
      minArches: 7,
      maxArches: 8,
      hp: "25HP",
      type: "single"
    },
    {
      partNumber: "VAC-30HP",
      name: "Eurovac III - 30 HP & 38\" Sep Detailed Vacuum System for 9-10 users",
      price: 21363.00,
      minArches: 9,
      maxArches: 10,
      hp: "30HP",
      type: "single"
    },
    {
      partNumber: "VAC-40HP",
      name: "Eurovac III - 40 HP & 30\" Sep Detailed Vacuum System for 11-13 users",
      price: 26176.00,
      minArches: 11,
      maxArches: 13,
      hp: "40HP",
      type: "single"
    },
    {
      partNumber: "VAC-50HP",
      name: "Eurovac III - 50 HP & 42\" Sep Detailed Vacuum System for 14-16 users",
      price: 31713.00,
      minArches: 14,
      maxArches: 16,
      hp: "50HP",
      type: "single"
    },
    {
      partNumber: "VAC-60HP",
      name: "Eurovac III - 60 HP & 48\" Sep Detailed Vacuum System for 16-20 users",
      price: 40210.00,
      minArches: 16,
      maxArches: 20,
      hp: "60HP",
      type: "single"
    },
    {
      partNumber: "VAC-75HP",
      name: "Eurovac III - 75 HP & 54\" Sep Detailed Vacuum System for 14-16 users",
      price: 48545.00,
      minArches: 14,
      maxArches: 16,
      hp: "75HP",
      type: "single"
    },
    {
      partNumber: "VAC-DUAL-20HP",
      name: "Eurovac III Double 20 HP & 38\" Bag Separator for 12-13 drops",
      price: 30321.00,
      minArches: 12,
      maxArches: 13,
      hp: "Dual 20HP",
      type: "dual"
    },
    {
      partNumber: "VAC-DUAL-25HP",
      name: "Eurovac III Double 25 HP & 42\" Bag Separator for 14-16 drops",
      price: 35744.00,
      minArches: 14,
      maxArches: 16,
      hp: "Dual 25HP",
      type: "dual"
    },
    {
      partNumber: "VAC-DUAL-30HP",
      name: "Eurovac III Double 30 HP & 48\" Bag Separator for 17-19 drops",
      price: 41400.00,
      minArches: 17,
      maxArches: 19,
      hp: "Dual 30HP",
      type: "dual"
    },
    {
      partNumber: "VAC-DUAL-40HP",
      name: "Eurovac III Double 40 HP & 54\" Bag Separator for 20-22 drops",
      price: 50303.00,
      minArches: 20,
      maxArches: 22,
      hp: "Dual 40HP",
      type: "dual"
    },
    {
      partNumber: "VAC-DUAL-50HP",
      name: "Eurovac III Double 50 HP & 66\" Bag Separator for 23-25 drops",
      price: 0.00,
      minArches: 23,
      maxArches: 25,
      hp: "Dual 50HP",
      type: "dual"
    },
    {
      partNumber: "VAC-DUAL-60HP",
      name: "Eurovac III Double 60 HP & 60\" Bag Separator for 26-28 drops",
      price: 0.00,
      minArches: 26,
      maxArches: 28,
      hp: "Dual 60HP",
      type: "dual"
    }
  ],
  vfdControls: {
    "10HP": {
      "230/460": { partNumber: "VAC-10HP-480-VFD", price: 0.00 },
      "575": { partNumber: "VAC-10HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-10HP-380-VFD", price: 0.00 }
    },
    "15HP": {
      "230/460": { partNumber: "VAC-15HP-480-VFD", price: 9235.00 },
      "575": { partNumber: "VAC-15HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-15HP-380-VFD", price: 0.00 }
    },
    "20HP": {
      "230/460": { partNumber: "VAC-20HP-480-VFD", price: 7740.00 },
      "575": { partNumber: "VAC-20HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-20HP-380-VFD", price: 0.00 }
    },
    "25HP": {
      "230/460": { partNumber: "VAC-25HP-480-VFD", price: 9275.00 },
      "575": { partNumber: "VAC-25HP-575-VFD", price: 10180.00 },
      "380": { partNumber: "VAC-25HP-380-VFD", price: 0.00 }
    },
    "30HP": {
      "230/460": { partNumber: "VAC-30HP-480-VFD", price: 10270.00 },
      "575": { partNumber: "VAC-30HP-575-VFD", price: 12059.00 },
      "380": { partNumber: "VAC-30HP-380-VFD", price: 0.00 }
    },
    "40HP": {
      "230/460": { partNumber: "VAC-40HP-480-VFD", price: 11790.00 },
      "575": { partNumber: "VAC-40HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-40HP-380-VFD", price: 0.00 }
    },
    "50HP": {
      "230/460": { partNumber: "VAC-50HP-480-VFD", price: 13395.00 },
      "575": { partNumber: "VAC-50HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-50HP-380-VFD", price: 0.00 }
    },
    "60HP": {
      "230/460": { partNumber: "VAC-60HP-480-VFD", price: 15615.00 },
      "575": { partNumber: "VAC-60HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-60HP-380-VFD", price: 0.00 }
    },
    "75HP": {
      "230/460": { partNumber: "VAC-75HP-480-VFD", price: 17610.00 },
      "575": { partNumber: "VAC-75HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-75HP-380-VFD", price: 0.00 }
    },
    "Dual 15HP": {
      "230/460": { partNumber: "VAC-DUAL-15HP-480-VFD", price: 18063.00 },
      "575": { partNumber: "VAC-DUAL-15HP-575-VFD", price: 18063.00 },
      "380": { partNumber: "VAC-DUAL-15HP-380-VFD", price: 18063.00 }
    },
    "Dual 20HP": {
      "230/460": { partNumber: "VAC-DUAL-20HP-480-VFD", price: 19913.00 },
      "575": { partNumber: "VAC-DUAL-20HP-575-VFD", price: 19913.00 },
      "380": { partNumber: "VAC-DUAL-20HP-380-VFD", price: 19913.00 }
    },
    "Dual 25HP": {
      "230/460": { partNumber: "VAC-DUAL-25HP-480-VFD", price: 0.00 },
      "575": { partNumber: "VAC-DUAL-25HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-DUAL-25HP-380-VFD", price: 0.00 }
    },
    "Dual 30HP": {
      "230/460": { partNumber: "VAC-DUAL-30HP-480-VFD", price: 20720.00 },
      "575": { partNumber: "VAC-DUAL-30HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-DUAL-30HP-380-VFD", price: 0.00 }
    },
    "Dual 40HP": {
      "230/460": { partNumber: "VAC-DUAL-40HP-480-VFD", price: 20520.00 },
      "575": { partNumber: "VAC-DUAL-40HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-DUAL-40HP-380-VFD", price: 0.00 }
    },
    "Dual 50HP": {
      "230/460": { partNumber: "VAC-DUAL-50HP-480-VFD", price: 0.00 },
      "575": { partNumber: "VAC-DUAL-50HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-DUAL-50HP-380-VFD", price: 0.00 }
    },
    "Dual 60HP": {
      "230/460": { partNumber: "VAC-DUAL-60HP-480-VFD", price: 0.00 },
      "575": { partNumber: "VAC-DUAL-60HP-575-VFD", price: 0.00 },
      "380": { partNumber: "VAC-DUAL-60HP-380-VFD", price: 0.00 }
    }
  },
  workstations: {
    "VAC-ALUM-05": {
      partNumber: "VAC-ALUM-05-WORKSTATION",
      name: "Central Vac Line Kit; Post/Arch Aluminum Detail Workstation, Above Ground(for 1-5 bays)",
      minBays: 1,
      maxBays: 5,
      price: 1266.00
    },
    "VAC-ALUM-10": {
      partNumber: "VAC-ALUM-10-WORKSTATION",
      name: "Central Vac Line Kit; Post/Arch Aluminum Detail Workstation, Above Ground(for 6-10 bays)",
      minBays: 6,
      maxBays: 10,
      price: 1371.00
    },
    "VAC-ALUM-15": {
      partNumber: "VAC-ALUM-15-WORKSTATION",
      name: "Central Vac Line Kit: Detail Workstation, Above Ground(for 11-15 bays)",
      minBays: 11,
      maxBays: 15,
      price: 1485.00
    },
    "VAC-ALUM-20": {
      partNumber: "VAC-ALUM-20-WORKSTATION",
      name: "Central Vac Line Kit:Detail Workstation, Above Ground(for 16-20 bays)",
      minBays: 16,
      maxBays: 20,
      price: 1590.00
    }
  },
  components: {
    arches: {
      "VA5129A-1": { name: "Single Vacuum Canopy Arch, 5\" Round Post", price: 4066.00 },
      "VA5129A-2": { name: "Dual Vacuum Canopy Arch, 5\" Round Post", price: 4153.00 }
    },
    archComponents: {
      "R-VA2476C1": { name: "Cap for Vacuum Arch, 6\" OD, UHMW", price: 114.00 },
      "VA3246S": { name: "Separator, Baffle Type, Self-Serve Vacuum", price: 1613.00 },
      "VA5129AV": { name: "Cover for Base Plate on Vacuum Arch (5\" Pipe)", price: 474.00 },
      "TS3352": { name: "Trash Can (55 gal. size, 36\" tall), w/Standard Lid, w/o Liner, Stainless Steel", price: 1333.00 },
      "GGBTL": { name: "G&G 6FT LED Bendable Tube Light w/cable", price: 590.00 },
      "VA5129-MAT": { name: "Arch Floor Mat Rack, Attachment to single 5\" Round Vacuum Arch, SS Mesh", price: 363.00 }
    },
    dropComponents: {
      "VA2567V": { name: "Vacuum Inlet Valve and 1-1/2\" Hose Connector Assembly", price: 92.20 },
      "VAC-CUFFSWIVEL-150HX150T": { name: "Swivel Cuff, 1-1/2\" Vacuum Hose x 1-1/2\" Tube, Gray", price: 5.60 }
    },
    tools: {
      crevice: {
        "VAC-CREVICE-TOOL": { name: "Crevice Tool, for 1-1/2\" Vacuum Hose", price: 7.80 },
        "VA3352WS": { name: "Crevice Tool Holster, Black.", price: 114.00 },
        "VA5129W": { name: "Single Tool Holster Bracket", price: 241.00 }
      },
      claw: {
        "VAC-CLAW-NOZ": { name: "Claw Nozzle, 13\"Lg, for 1-1/2\" Vacuum Hose", price: 7.20 },
        "VA5129WS": { name: "Claw Hanger, Two-Peg Style with PVC Flapper Valve.", price: 175.00 },
        "VA5129WL": { name: "L Claw Holder Bracket, to Attach Two-Peg Vacuum Claw Holder to Holster Bracket, SS (includes fasteners)", price: 63.70 }
      }
    },
    hoses: {
      "VAC-HOSE-150": { name: "1-1/2\" Vacuum Hose (per foot)", price: 3.40 },
      "VAC-HOSE-2IN": { name: "2\" Vacuum Hose (per foot)", price: 4.50 }
    }
  }
};

// This calculator is the standalone vacuum-calculator app embedded verbatim (its pricing and
// logic are its own, not Supabase-driven like the rest of the tool). The only grafts onto it are
// at the edges: its inputs and its generated quote round-trip through selectionsStore so the
// quote survives a reload, and its button is now a Next that commits the result to the shared
// quote instead of a Generate Quote that only filled the panel below.
const readStoredJson = (raw) => {
  if (typeof raw !== 'string' || raw === '') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const VacuumQuoteCalculator = ({ onNext }) => {
  const setField = useSelectionsStore((s) => s.setField);
  // Read once, at mount, straight from the store: these seed local state, and letting them
  // re-render the tab on every keystroke would fight the local state that owns them.
  const [storedConfig] = useState(() => readStoredJson(useSelectionsStore.getState().values[VACUUM_CONFIG_FIELD]));
  const [storedQuote] = useState(() => {
    const values = useSelectionsStore.getState().values;
    const items = values[VACUUM_QUOTE_ITEMS_FIELD];
    const stats = readStoredJson(values[VACUUM_STATS_FIELD]);
    if (!Array.isArray(items) || items.length === 0 || !stats) return null;
    return {
      config: stats,
      lineItems: items.map((part) => ({
        partNumber: part.part_number,
        description: part.description,
        qty: part.quantity ?? 1,
        unitPrice: part.unit_price,
        total: part.unit_price * (part.quantity ?? 1),
      })),
      subtotal: items.reduce((sum, part) => sum + part.unit_price * (part.quantity ?? 1), 0),
    };
  });

  const [rows, setRows] = useState(storedConfig?.rows ?? [{ id: 1, spots: 5 }]);
  const [centralUnits, setCentralUnits] = useState(storedConfig?.centralUnits ?? [{ id: 1, unit: '', quantity: 1 }]);
  const [siteVoltage, setSiteVoltage] = useState(storedConfig?.siteVoltage ?? '230/460');
  const [toolPreference, setToolPreference] = useState(storedConfig?.toolPreference ?? 'half');
  const [quote, setQuote] = useState(storedQuote);

  // Writes the generated quote into the shared selections: the line items as SelectedPart[] (so
  // lib/pricing.ts totals them automatically), the stats and the raw inputs as JSON strings.
  const commitQuote = (generated) => {
    setField(
      VACUUM_QUOTE_ITEMS_FIELD,
      generated.lineItems.map((item) => ({
        part_number: item.partNumber,
        description: item.description,
        unit_price: item.unitPrice,
        image_url: null,
        quantity: item.qty,
      }))
    );
    setField(VACUUM_STATS_FIELD, JSON.stringify(generated.config));
    setField(VACUUM_CONFIG_FIELD, JSON.stringify({ rows, centralUnits, siteVoltage, toolPreference }));
  };

  // Calculate total arches across all rows
  const calculateTotalArches = () => {
    return rows.reduce((total, row) => {
      if (!row.spots || row.spots === '') return total;
      // For each row: 2 single arches (beginning and end) + (spots - 1) dual arches
      const dualArches = row.spots > 1 ? row.spots - 1 : 0;
      return total + 2 + dualArches; // 2 single + dual arches
    }, 0);
  };

  // Calculate drops per row
  const calculateDropsPerRow = (spots) => {
    if (!spots || spots === '') return 0;
    // Drops = (dual arches * 2) + single arches
    const dualArches = spots > 1 ? spots - 1 : 0;
    const singleArches = 2;
    return (dualArches * 2) + singleArches;
  };

  // Calculate total drops
  const calculateTotalDrops = () => {
    return rows.reduce((total, row) => {
      if (!row.spots || row.spots === '') return total;
      return total + calculateDropsPerRow(row.spots);
    }, 0);
  };

  const totalArches = calculateTotalArches();
  const totalDrops = calculateTotalDrops();
  const totalBays = rows.reduce((sum, row) => sum + (row.spots || 0), 0);

  // Functions for managing central units
  const addCentralUnit = () => {
    setCentralUnits([...centralUnits, { id: centralUnits.length + 1, unit: '', quantity: 1 }]);
  };

  const removeCentralUnit = (index) => {
    if (centralUnits.length > 1) {
      setCentralUnits(centralUnits.filter((_, i) => i !== index));
    }
  };

  const updateCentralUnit = (index, field, value) => {
    const newUnits = [...centralUnits];
    newUnits[index][field] = value;
    setCentralUnits(newUnits);
  };

  const addRow = () => {
    setRows([...rows, { id: rows.length + 1, spots: 5 }]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const updateRowSpots = (index, value) => {
    const newRows = [...rows];
    newRows[index].spots = value === '' ? '' : value;
    setRows(newRows);
  };

  // Round to nearest 50
  const roundToNearest50 = (value) => {
    return Math.ceil(value / 50) * 50;
  };

  const calculateQuote = () => {
    // Validate all central units are selected
    const hasEmptyUnits = centralUnits.some(cu => !cu.unit || cu.unit === '');
    if (hasEmptyUnits) {
      alert('Please select all central units');
      return;
    }

    // Validate all central units have valid quantities
    const hasInvalidQuantity = centralUnits.some(cu => !cu.quantity || cu.quantity < 1);
    if (hasInvalidQuantity) {
      alert('Please ensure all central units have a quantity of at least 1');
      return;
    }

    // Validate all rows have valid spots
    const hasEmptyRows = rows.some(row => !row.spots || row.spots === '' || row.spots < 2);
    if (hasEmptyRows) {
      alert('Please ensure all rows have at least 2 bays');
      return;
    }

    // Validate central unit capacity
    const warnings = [];

    // Calculate total capacity from all central units (all use arches now)
    let totalCapacity = { min: 0, max: 0 };

    centralUnits.forEach(cu => {
      const selectedUnit = priceData.centralUnits.find(u => u.partNumber === cu.unit);
      if (selectedUnit) {
        // All units use arches now
        totalCapacity.min += selectedUnit.minArches * cu.quantity;
        totalCapacity.max += selectedUnit.maxArches * cu.quantity;
      }
    });

    // Check if total capacity is sufficient for total arches (only undersized)
    if (totalCapacity.max > 0) {
      if (totalArches > totalCapacity.max) {
        warnings.push(`⚠️ Central Units: Your configuration has ${totalArches} arches but your selected units can only handle up to ${totalCapacity.max} arches. Please increase quantity or add more units.`);
      }
    }

    // Show warnings if any
    if (warnings.length > 0) {
      const proceed = confirm(
        `Central Unit Capacity Warning:\n\n${warnings.join('\n\n')}\n\nDo you want to proceed with this configuration anyway?`
      );
      if (!proceed) {
        return;
      }
    }

    const lineItems = [];

    // 1. Central Units (FIRST ITEMS) - Add all selected units with their quantities
    centralUnits.forEach(cu => {
      const selectedUnit = priceData.centralUnits.find(u => u.partNumber === cu.unit);
      if (selectedUnit) {
        lineItems.push({
          partNumber: selectedUnit.partNumber,
          description: selectedUnit.name,
          qty: cu.quantity,
          unitPrice: selectedUnit.price,
          total: selectedUnit.price * cu.quantity
        });
      }
    });

    // 2. VFD Controls - Add for each central unit with their quantities
    centralUnits.forEach(cu => {
      const selectedUnit = priceData.centralUnits.find(u => u.partNumber === cu.unit);
      if (selectedUnit) {
        const vfdControl = priceData.vfdControls[selectedUnit.hp]?.[siteVoltage];
        if (vfdControl) {
          lineItems.push({
            partNumber: vfdControl.partNumber,
            description: `${selectedUnit.hp} - ${siteVoltage}V Outdoor VFD Control Panel`,
            qty: cu.quantity,
            unitPrice: vfdControl.price,
            total: vfdControl.price * cu.quantity
          });
        }
      }
    });

    // 3. Workstations (per row, based on spots per row)
    rows.forEach((row, index) => {
      const workstation = Object.values(priceData.workstations).find(w =>
        row.spots >= w.minBays && row.spots <= w.maxBays
      );

      if (workstation) {
        lineItems.push({
          partNumber: workstation.partNumber,
          description: `${workstation.name} (Row ${index + 1})`,
          qty: row.spots,
          unitPrice: workstation.price,
          total: workstation.price * row.spots
        });
      }
    });

    // 4. Arches (per row)
    let totalSingleArches = 0;
    let totalDualArches = 0;

    rows.forEach((row) => {
      const dualArches = row.spots > 1 ? row.spots - 1 : 0;
      totalSingleArches += 2; // Beginning and end
      totalDualArches += dualArches;
    });

    // Add single arches
    if (totalSingleArches > 0) {
      const singleArch = priceData.components.arches["VA5129A-1"];
      lineItems.push({
        partNumber: "VA5129A-1",
        description: singleArch.name,
        qty: totalSingleArches,
        unitPrice: singleArch.price,
        total: singleArch.price * totalSingleArches
      });
    }

    // Add dual arches
    if (totalDualArches > 0) {
      const dualArch = priceData.components.arches["VA5129A-2"];
      lineItems.push({
        partNumber: "VA5129A-2",
        description: dualArch.name,
        qty: totalDualArches,
        unitPrice: dualArch.price,
        total: dualArch.price * totalDualArches
      });
    }

    // 5. Arch Components (based on total arches)
    Object.entries(priceData.components.archComponents).forEach(([partNum, component]) => {
      lineItems.push({
        partNumber: partNum,
        description: component.name,
        qty: totalArches,
        unitPrice: component.price,
        total: component.price * totalArches
      });
    });

    // 6. Drop Components (inlet valves and swivel cuffs - based on total drops)
    const inletValve = priceData.components.dropComponents["VA2567V"];
    lineItems.push({
      partNumber: "VA2567V",
      description: inletValve.name,
      qty: totalDrops,
      unitPrice: inletValve.price,
      total: inletValve.price * totalDrops
    });

    const swivelCuff = priceData.components.dropComponents["VAC-CUFFSWIVEL-150HX150T"];
    lineItems.push({
      partNumber: "VAC-CUFFSWIVEL-150HX150T",
      description: swivelCuff.name,
      qty: totalDrops,
      unitPrice: swivelCuff.price,
      total: swivelCuff.price * totalDrops
    });

    // 7. Tools (based on preference - total must equal totalDrops)
    if (toolPreference === 'half') {
      const creviceCount = Math.ceil(totalDrops / 2);
      const clawCount = totalDrops - creviceCount;

      // Crevice tools
      const creviceTool = priceData.components.tools.crevice["VAC-CREVICE-TOOL"];
      lineItems.push({
        partNumber: "VAC-CREVICE-TOOL",
        description: creviceTool.name,
        qty: creviceCount,
        unitPrice: creviceTool.price,
        total: creviceTool.price * creviceCount
      });

      const creviceHolster = priceData.components.tools.crevice["VA3352WS"];
      lineItems.push({
        partNumber: "VA3352WS",
        description: creviceHolster.name,
        qty: creviceCount,
        unitPrice: creviceHolster.price,
        total: creviceHolster.price * creviceCount
      });

      const creviceBracket = priceData.components.tools.crevice["VA5129W"];
      lineItems.push({
        partNumber: "VA5129W",
        description: creviceBracket.name,
        qty: creviceCount,
        unitPrice: creviceBracket.price,
        total: creviceBracket.price * creviceCount
      });

      // Claw tools
      const clawNozzle = priceData.components.tools.claw["VAC-CLAW-NOZ"];
      lineItems.push({
        partNumber: "VAC-CLAW-NOZ",
        description: clawNozzle.name,
        qty: clawCount,
        unitPrice: clawNozzle.price,
        total: clawNozzle.price * clawCount
      });

      const clawHanger = priceData.components.tools.claw["VA5129WS"];
      lineItems.push({
        partNumber: "VA5129WS",
        description: clawHanger.name,
        qty: clawCount,
        unitPrice: clawHanger.price,
        total: clawHanger.price * clawCount
      });

      const clawBracket = priceData.components.tools.claw["VA5129WL"];
      lineItems.push({
        partNumber: "VA5129WL",
        description: clawBracket.name,
        qty: clawCount,
        unitPrice: clawBracket.price,
        total: clawBracket.price * clawCount
      });

    } else if (toolPreference === 'claw') {
      // All claw tools
      const clawNozzle = priceData.components.tools.claw["VAC-CLAW-NOZ"];
      lineItems.push({
        partNumber: "VAC-CLAW-NOZ",
        description: clawNozzle.name,
        qty: totalDrops,
        unitPrice: clawNozzle.price,
        total: clawNozzle.price * totalDrops
      });

      const clawHanger = priceData.components.tools.claw["VA5129WS"];
      lineItems.push({
        partNumber: "VA5129WS",
        description: clawHanger.name,
        qty: totalDrops,
        unitPrice: clawHanger.price,
        total: clawHanger.price * totalDrops
      });

      const clawBracket = priceData.components.tools.claw["VA5129WL"];
      lineItems.push({
        partNumber: "VA5129WL",
        description: clawBracket.name,
        qty: totalDrops,
        unitPrice: clawBracket.price,
        total: clawBracket.price * totalDrops
      });

    } else {
      // All crevice tools
      const creviceTool = priceData.components.tools.crevice["VAC-CREVICE-TOOL"];
      lineItems.push({
        partNumber: "VAC-CREVICE-TOOL",
        description: creviceTool.name,
        qty: totalDrops,
        unitPrice: creviceTool.price,
        total: creviceTool.price * totalDrops
      });

      const creviceHolster = priceData.components.tools.crevice["VA3352WS"];
      lineItems.push({
        partNumber: "VA3352WS",
        description: creviceHolster.name,
        qty: totalDrops,
        unitPrice: creviceHolster.price,
        total: creviceHolster.price * totalDrops
      });

      const creviceBracket = priceData.components.tools.crevice["VA5129W"];
      lineItems.push({
        partNumber: "VA5129W",
        description: creviceBracket.name,
        qty: totalDrops,
        unitPrice: creviceBracket.price,
        total: creviceBracket.price * totalDrops
      });
    }

    // 8. Hoses
    // 1.5" hose: drops * 25 feet, rounded to nearest 50
    const hose15Feet = totalDrops * 25;
    const hose15Rounded = roundToNearest50(hose15Feet);
    const hose15 = priceData.components.hoses["VAC-HOSE-150"];
    lineItems.push({
      partNumber: "VAC-HOSE-150",
      description: `${hose15.name} (${hose15Rounded} ft)`,
      qty: hose15Rounded,
      unitPrice: hose15.price,
      total: roundToNearest50(hose15Rounded * hose15.price)
    });

    // 2" hose: total arches * 5 feet, rounded to nearest 50
    const hose2Feet = totalArches * 5;
    const hose2Rounded = roundToNearest50(hose2Feet);
    const hose2 = priceData.components.hoses["VAC-HOSE-2IN"];
    lineItems.push({
      partNumber: "VAC-HOSE-2IN",
      description: `${hose2.name} (${hose2Rounded} ft)`,
      qty: hose2Rounded,
      unitPrice: hose2.price,
      total: roundToNearest50(hose2Rounded * hose2.price)
    });

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

    const generated = {
      config: {
        rows: rows.length,
        totalArches: totalArches,
        totalDrops: totalDrops,
        centralUnits: centralUnits.map(cu => {
          const unit = priceData.centralUnits.find(u => u.partNumber === cu.unit);
          return `${cu.unit} (×${cu.quantity})`;
        }).join(', '),
        voltage: siteVoltage,
        toolPreference: toolPreference
      },
      lineItems,
      subtotal
    };

    setQuote(generated);
    // Returned (rather than only stashed in local state) so handleNext can commit the very same
    // figures to the quote — setQuote's update isn't readable within this tick.
    return generated;
  };

  // The tab's Next button: generate the vacuum quote, push its line items into the shared
  // quote (where they show up in the Quote Summary and roll into the total), then move on.
  // Validation failures inside calculateQuote return undefined and keep the user on this tab.
  const handleNext = () => {
    const generated = calculateQuote();
    if (!generated) return;
    commitQuote(generated);
    if (onNext) onNext();
  };

  const exportQuote = () => {
    if (!quote) return;

    let csvContent = 'Part Number,Description,Quantity,Unit Price,Total\n';

    quote.lineItems.forEach(item => {
      csvContent += `${item.partNumber},"${item.description}",${item.qty},${item.unitPrice.toFixed(2)},${item.total.toFixed(2)}\n`;
    });

    csvContent += `\n,,,,Subtotal,$${quote.subtotal.toFixed(2)}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vacuum-quote-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const deleteLineItem = (index) => {
    const updatedLineItems = quote.lineItems.filter((_, i) => i !== index);
    const newSubtotal = updatedLineItems.reduce((sum, item) => sum + item.total, 0);

    const updated = {
      ...quote,
      lineItems: updatedLineItems,
      subtotal: newSubtotal
    };
    setQuote(updated);
    // The row is already on the shared quote, so dropping it here has to drop it there too —
    // otherwise the Quote Summary and the total would keep charging for a deleted item.
    commitQuote(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * {
          font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Configuration Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
            System Configuration
          </h2>

          {/* Rows Section */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-slate-700 mb-3 block">Parking Rows</label>

            <div className="space-y-2">
              {rows.map((row, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-20">
                    <input
                      type="text"
                      value={`Row ${index + 1}`}
                      disabled
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium"
                    />
                  </div>

                  <div className="flex-1 max-w-xs">
                    <div className="relative">
                      <input
                        type="number"
                        min="2"
                        value={row.spots}
                        onChange={(e) => {
                          const value = e.target.value === '' ? '' : parseInt(e.target.value);
                          updateRowSpots(index, value);
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value) || 2;
                          updateRowSpots(index, value >= 2 ? value : 2);
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                        bays
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-xs text-slate-500">
                    {calculateDropsPerRow(row.spots)} drops
                  </div>

                  <div className="flex items-center gap-2">
                    {index === rows.length - 1 && (
                      <button
                        onClick={addRow}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-105 active:scale-95"
                        title="Add row"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}

                    {rows.length > 1 && (
                      <button
                        onClick={() => removeRow(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove row"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="text-slate-600">
                <span className="font-semibold text-slate-900">{totalArches}</span> total arches
              </div>
              <div className="text-slate-600">
                <span className="font-semibold text-slate-900">{totalDrops}</span> total drops
              </div>
            </div>
          </div>

          {/* Central Units Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                Central Units
                <span className="text-xs font-normal text-slate-500">({totalBays} total bays)</span>
              </label>
            </div>

            <div className="space-y-3">
              {centralUnits.map((cu, index) => (
                <div key={cu.id} className="flex items-center gap-3">
                  <div className="w-80">
                    <select
                      value={cu.unit}
                      onChange={(e) => updateCentralUnit(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 bg-white"
                    >
                      <option value="">Select central unit</option>
                      {priceData.centralUnits.map(unit => (
                        <option key={unit.partNumber} value={unit.partNumber}>
                          {unit.partNumber} ({unit.minArches}-{unit.maxArches} arches)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={cu.quantity}
                        onChange={(e) => {
                          const value = e.target.value === '' ? '' : parseInt(e.target.value);
                          updateCentralUnit(index, 'quantity', value);
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          updateCentralUnit(index, 'quantity', value >= 1 ? value : 1);
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 pr-8"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                        qty
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {index === centralUnits.length - 1 && (
                      <button
                        onClick={addCentralUnit}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-105 active:scale-95"
                        title="Add central unit"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}

                    {centralUnits.length > 1 && (
                      <button
                        onClick={() => removeCentralUnit(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove central unit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Site Voltage</label>
              <select
                value={siteVoltage}
                onChange={(e) => setSiteVoltage(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 bg-white"
              >
                <option value="230/460">230/460V (US Standard)</option>
                <option value="575">575V (Canada)</option>
                <option value="380">380V (Australia / Europe)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Tool Preference</label>
              <select
                value={toolPreference}
                onChange={(e) => setToolPreference(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 bg-white"
              >
                <option value="half">50/50 Mix (Crevice + Claw)</option>
                <option value="crevice">Crevice Tools Only</option>
                <option value="claw">Claw Tools Only</option>
              </select>
            </div>
          </div>

          {/* Next: generates the vacuum quote, adds it to the Quote Summary, advances a tab */}
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Calculator className="w-5 h-5" />
            Next
          </button>
        </div>

        {/* Quote Results */}
        {quote && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-5 bg-green-600 rounded-full"></div>
                Quote Summary
              </h2>
              <button
                onClick={exportQuote}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Total Rows</p>
                <p className="text-2xl font-bold text-slate-900">{quote.config.rows}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Total Arches</p>
                <p className="text-2xl font-bold text-slate-900">{quote.config.totalArches}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">Central Units</p>
                <p className="text-sm font-bold text-blue-900">{quote.config.centralUnits}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Total Drops</p>
                <p className="text-2xl font-bold text-slate-900">{quote.config.totalDrops}</p>
              </div>
            </div>

            {/* Quote Table */}
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Part No.</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Qty</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Unit Price</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 text-xs font-mono text-slate-700 font-medium">{item.partNumber}</td>
                      <td className="px-3 py-3 text-sm text-slate-700">{item.description}</td>
                      <td className="px-3 py-3 text-sm text-center text-slate-900 font-medium">{item.qty}</td>
                      <td className="px-3 py-3 text-sm text-right text-slate-700 font-mono">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-3 text-sm text-right font-semibold text-slate-900 font-mono">${item.total.toFixed(2)}</td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => deleteLineItem(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan="4" className="px-3 py-4 text-right text-base font-bold text-slate-900">Subtotal:</td>
                    <td colSpan="2" className="px-3 py-4 text-right text-xl font-bold text-blue-600 font-mono">${quote.subtotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VacuumQuoteCalculator;
