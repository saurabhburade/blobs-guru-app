// @generated
// @@protoc_insertion_point(attribute:example)
pub mod example {
    include!("example.rs");
    // @@protoc_insertion_point(example)
}
pub mod sf {
    pub mod ethereum {
        pub mod r#type {
            // @@protoc_insertion_point(attribute:sf.ethereum.type.v2)
            pub mod v2 {
                include!("sf.ethereum.type.v2.rs");
                // @@protoc_insertion_point(sf.ethereum.type.v2)
                // @@protoc_insertion_point(attribute:sf.ethereum.type.v2.clone)
                pub mod clone {
                    include!("sf.ethereum.type.v2.clone.rs");
                    // @@protoc_insertion_point(sf.ethereum.type.v2.clone)
                }
            }
        }
        pub mod substreams {
            // @@protoc_insertion_point(attribute:sf.ethereum.substreams.v1)
            pub mod v1 {
                include!("sf.ethereum.substreams.v1.rs");
                // @@protoc_insertion_point(sf.ethereum.substreams.v1)
            }
        }
    }
}
pub mod substreams {
    pub mod entity {
        // @@protoc_insertion_point(attribute:substreams.entity.v1)
        pub mod v1 {
            include!("substreams.entity.v1.rs");
            // @@protoc_insertion_point(substreams.entity.v1)
        }
    }
}
