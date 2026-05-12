import traceback
from schemas import UserCreate
import crud
print('testing')
try:
  crud.create_user(UserCreate(username='zhuma2', password='password'))
  print('success')
except Exception:
  traceback.print_exc()
