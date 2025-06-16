import CardSection from '../components/reusablecomponents/CardSection';

const cards1 = [
  { title: 'Add Store' },
  { title: 'Total Inventory\nCount' },
  { title: 'View\nExpenses' },
  { title: 'Report\nBuilder' },
  { title: 'Settings' },
];

const cards2 = [
  { title: 'Store\nStats' },
  { title: 'Tax\nReports' },
  { title: 'Custom\nBuilder' },
   { title: 'Report\nBuilder' },
  { title: 'Settings' },
];

const cards3 = [
  { title: 'User\nLogs' },
  { title: 'Access\nControl' },
   { title: 'Report\nBuilder' },
  { title: 'Settings' },
  { title: 'Tax\nReports' },

];

export default function Dashboard() {
  return (
    <div className="p-4">
      <CardSection sectionTitle="Liabilities" cards={cards1}  />
      <br />
      <CardSection sectionTitle="Cost" cards={cards2} />
      <br />
      <CardSection sectionTitle="Bank" cards={cards3} />
    </div>
  );
}
