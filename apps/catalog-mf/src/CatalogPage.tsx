import { observer } from 'mobx-react-lite'
import { ProductsPage } from '@grocery-delivery/app-core'

const CatalogPage = observer(function CatalogPage() {
  return <ProductsPage />
})

export default CatalogPage
