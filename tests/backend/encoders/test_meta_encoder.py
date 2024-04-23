import unittest
from backend.encoders.meta_encoder import MetaData
from backend.encoders.error_sys import Error


class TestMetaData(unittest.TestCase):

    def setUp(self):
        self.meta = MetaData()

    def test_initialization(self):
        self.assertEqual(self.meta.get_errors(), [])
        self.assertIsNone(self.meta._object.get("created"))

    def test_attach_metadata_success(self):
        test_obj = {}
        self.meta.attach(test_obj)
        self.assertIn("imeta", test_obj)

    def test_set_and_get_domain(self):
        domain = "example.com"
        self.meta.set_domain(domain)
        self.assertEqual(self.meta._object["domain"], domain)

    def test_set_as_new(self):
        self.meta.set_as_new()
        self.assertIsNotNone(self.meta.get_created())
        self.assertEqual(self.meta.get_version(), "")
        self.assertIsNone(self.meta.get_update_id())

    def test_set_as_update(self):
        owner_id = "123"
        self.meta.set_as_update(owner_id)
        self.assertEqual(self.meta.get_owner_id(), owner_id)
        self.assertEqual(self.meta.get_version(), "")

    def test_set_and_get_errors(self):
        errors = [Error("Error message")]
        self.meta.set_errors(errors)
        self.assertEqual(len(self.meta.get_errors()), 1)
        self.assertIsInstance(self.meta.get_errors()[0], Error)

    def test_to_json_dict(self):
        self.meta.set_domain("example.com")
        self.meta.set_as_new()
        errors = [Error("Error message")]
        self.meta.set_errors(errors)
        json_dict = self.meta.to_json_dict()
        self.assertIn("domain", json_dict)
        self.assertIn("errors", json_dict)
        self.assertEqual(len(json_dict["errors"]), 1)
        self.assertEqual(json_dict["domain"], "example.com")

    def test_changes_from_json_dict_exception(self):
        with self.assertRaises(Exception) as context:
            self.meta._changes_from_json_dict()
        self.assertEqual(
            str(context.exception), "Metadata does not support this method"
        )

    # # Outdated
    # def test_attach_metadata_existing_imeta(self):
    #     test_obj = {"imeta": {}}
    #     with self.assertRaises(Exception) as context:
    #         self.meta.attach(test_obj)
    #     self.assertEqual(str(context.exception), "imeta already exists in object")


if __name__ == "__main__":
    unittest.main()
