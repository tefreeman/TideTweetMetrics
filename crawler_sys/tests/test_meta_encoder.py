import unittest

from encoders.meta_encoder import *

class TestMetaEncoder(unittest.TestCase):

    def setUp(self):
        self.md = MetaData()

    # TODO
    def test_attach(self):
        obj = {"key": "val"}
        self.assertFalse("imeta" in obj)
        self.md.attach(obj)
        self.assertTrue("imeta" in obj)
    
    def test_owner_id(self):
        self.md._set_owner_id(420)
        self.assertEqual(self.md.get_owner_id(), 420)

    def test_update_id(self):
        self.md._set_update_id(1738)
        self.assertEqual(self.md.get_update_id(), 1738)
    
    def test_errors(self):
        self.md.set_errors([{"error": "something went wrong"}])
        self.assertEqual(self.md.get_errors()[0]["error"], "something went wrong")
    
    def test_version(self):
        self.md._set_version(2)
        self.assertEqual(self.md.get_version(), 2)
    
    def test_backup_file_id(self):
        self.md.set_backup_file_id(21)
        self.assertEqual(self.md.get_backup_file_id(), 21)
    
if __name__ == '__main__':
    unittest.main()