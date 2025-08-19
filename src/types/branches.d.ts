declare module '@/data/branches.json' {
  interface Branch {
    id: string;
    name: string;
    description: string;
  }
  const branches: Branch[];
  export default branches;
}
